const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const path = require('path');
const express = require('express');
const { createIndexProxyMiddleware } = require('./index-rendering/proxy-middleware');
const { createRenderIndexHtml } = require('./index-rendering/render-context');
const { mountSharedRoutes } = require('./shared/app-common');
const {
  checkPortInUse,
  checkPublicHostReachability,
  logError,
  resolveHttpsConfiguration,
} = require('./shared/runtime-utils');

const app = express();
const httpPort = 4300;
const httpsPort = 443;
const publicHost = 'av-booking-local.newshore.es';
const indexPath = path.join(__dirname, '../src/index.html');
const analyticsScriptsPath = path.join(__dirname, '../src/assets/analytics/scripts');
const configDir = path.join(__dirname, '../src/assets/config-site');
const countriesFlagsDir = path.join(__dirname, '../src/app/modules/design-system/assets/ui_plus/imgs/countries-flags');
const targetHost = 'localhost';
const targetPort = 4200;
const umbracoTargetHost = publicHost;
const umbracoTargetPort = 80;
const healthCheckPath = '/__proxy-health';
const enableFakeApi = process.env.ENABLE_FAKE_API !== 'false';
const ssoBypassKeycloak = process.argv.includes('--sso-bypass-config');

const sslPfxPath = path.join(__dirname, 'cert', 'newshoreGeneral.pfx');
const sslPemPath = path.join(__dirname, 'cert', 'newshoreGeneral.pem');
const sslPfxPassphrase = '123456';

const { hasHttpsConfig, getHttpsOptions } = resolveHttpsConfiguration({
  sslPemPath,
  sslPfxPath,
  sslPfxPassphrase,
});

const httpsBaseUrl = `https://${publicHost}${httpsPort === 443 ? '' : `:${httpsPort}`}`;
const httpBaseUrl = `http://localhost:${httpPort}`;

/**
 * Forwards WebSocket upgrade requests transparently to the Angular dev server.
 * This makes live-reload work for browsers connected via the proxy (port 4300
 * or the public HTTPS domain) without any client-side changes.
 * TLS is already terminated by the HTTPS server before this handler runs,
 * so we always connect to the upstream with plain TCP.
 */
function attachWebSocketProxy(server) {
  server.on('upgrade', (req, clientSocket, head) => {
    const targetSocket = net.connect(targetPort, targetHost, () => {
      const reqLines = [`${req.method} ${req.url} HTTP/1.1`];
      const rawHeaders = req.rawHeaders;
      for (let i = 0; i < rawHeaders.length; i += 2) {
        if (rawHeaders[i].toLowerCase() === 'host') {
          reqLines.push(`Host: ${targetHost}:${targetPort}`);
        } else {
          reqLines.push(`${rawHeaders[i]}: ${rawHeaders[i + 1]}`);
        }
      }
      reqLines.push('', '');
      targetSocket.write(reqLines.join('\r\n'));
      if (head && head.length > 0) {
        targetSocket.write(head);
      }
      targetSocket.pipe(clientSocket);
      clientSocket.pipe(targetSocket);
    });

    const cleanup = () => {
      clientSocket.destroy();
      targetSocket.destroy();
    };
    targetSocket.on('error', cleanup);
    clientSocket.on('error', cleanup);
  });
}

async function warnIfPublicHostIsUnreachable() {
  const result = await checkPublicHostReachability(httpsBaseUrl, healthCheckPath);
  if (result.ok) {
    return;
  }

  const reason = result.error || `HTTP ${result.status || 'unknown'}`;
  logError(`[Proxy health] ${httpsBaseUrl} is not reachable (${reason}).`);
  logError(
    '[Proxy health] Please verify DNS/hosts mapping and local certificate trust for av-booking-local.newshore.es.'
  );
}

const renderIndexHtml = createRenderIndexHtml({
  port: httpPort,
  baseUrl: hasHttpsConfig ? httpsBaseUrl : httpBaseUrl,
  indexPath,
  configDir,
  analyticsScriptsPath,
});

mountSharedRoutes(app, {
  healthCheckPath,
  countriesFlagsDir,
  enableFakeApi,
  ssoBypassKeycloak,
  fakeApiLogLabel: '[Fake API] Enabled without prefix',
});

app.use(
  createIndexProxyMiddleware({
    targetHost,
    targetPort,
    umbracoTargetHost,
    umbracoTargetPort,
    renderIndexHtml,
  })
);

async function startProxyServers() {
  const httpPortCheck = await checkPortInUse(httpPort);
  if (httpPortCheck.inUse) {
    logError(`[Proxy startup] HTTP port ${httpPort} is already in use (${httpBaseUrl}).`);
    return;
  }
  if (httpPortCheck.error) {
    logError(`[Proxy startup] HTTP port check failed (${httpPort}): ${httpPortCheck.error}`);
  }

  const httpServer = http.createServer(app);
  attachWebSocketProxy(httpServer);
  httpServer.listen(httpPort, () => {
    console.log(`Index server running on ${httpBaseUrl}`);
    console.log(`Forwarding assets/chunks to http://${targetHost}:${targetPort}`);
  });

  if (!hasHttpsConfig) {
    console.log('HTTPS disabled: server/cert/newshoreGeneral.pem or server/cert/newshoreGeneral.pfx not found.');
    return;
  }

  const httpsPortCheck = await checkPortInUse(httpsPort);
  if (httpsPortCheck.inUse) {
    logError(`[Proxy startup] HTTPS port ${httpsPort} is already in use (${httpsBaseUrl}).`);
    return;
  }
  if (httpsPortCheck.error) {
    logError(`[Proxy startup] HTTPS port check failed (${httpsPort}): ${httpsPortCheck.error}`);
  }

  try {
    const httpsOptions = getHttpsOptions();

    const httpsServer = https.createServer(httpsOptions, app);
    attachWebSocketProxy(httpsServer);

    httpsServer.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`HTTPS startup failed: ${message}`);

      if (
        process.platform === 'linux' &&
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'EACCES' &&
        httpsPort === 443
      ) {
        console.error('Port 443 requires elevated bind permission on Linux.');
        console.error('Run `npm run linux:enable-port-443` once, then start the app again.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
        console.error(`Port ${httpsPort} is already in use.`);
      } else {
        console.error('Continuing with HTTP only.');
      }
    });

    httpsServer.listen(httpsPort, () => {
      console.log(`Index server running on ${httpsBaseUrl}`);
      // Run after HTTPS bind to avoid false negatives during startup race.
      setTimeout(() => {
        void warnIfPublicHostIsUnreachable();
      }, 150);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`HTTPS startup failed: ${message}`);
    console.error('Continuing with HTTP only.');
    console.error('If using PFX, verify the configured passphrase matches the certificate password.');
  }
}

void startProxyServers();
