const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { createRenderIndexHtml } = require('./index-rendering/render-context');
const { mountSharedRoutes } = require('./shared/app-common');
const {
  checkPortInUse,
  checkPublicHostReachability,
  logError,
  resolveHttpsConfiguration,
} = require('./shared/runtime-utils');

const app = express();
const httpPort = Number(process.env.BACKEND_HTTP_PORT || 4400);
const httpsPort = Number(process.env.BACKEND_HTTPS_PORT || 443);
const publicHost = process.env.PUBLIC_HOST || 'av-booking-local.newshore.es';
const healthCheckPath = '/__backend-health';
const enableFakeApi = process.env.ENABLE_FAKE_API !== 'false';

const distDir = path.join(__dirname, '..', 'dist', 'dynamic-site', 'browser');
const distIndexPath = path.join(distDir, 'index.html');
const distAnalyticsScriptsPath = path.join(distDir, 'assets', 'analytics', 'scripts');
const srcAnalyticsScriptsPath = path.join(__dirname, '..', 'src', 'assets', 'analytics', 'scripts');
const distConfigDir = path.join(distDir, 'assets', 'config-site');
const srcConfigDir = path.join(__dirname, '..', 'src', 'assets', 'config-site');
const sslPfxPath = path.join(__dirname, 'cert', 'newshoreGeneral.pfx');
const sslPemPath = path.join(__dirname, 'cert', 'newshoreGeneral.pem');
const sslPfxPassphrase = '123456';
const srcCountriesFlagsDir = path.join(
  __dirname,
  '..',
  'src',
  'app',
  'modules',
  'design-system',
  'assets',
  'ui_plus',
  'imgs',
  'countries-flags'
);

const configDir = fs.existsSync(distConfigDir) ? distConfigDir : srcConfigDir;
const analyticsScriptsPath = fs.existsSync(distAnalyticsScriptsPath)
  ? distAnalyticsScriptsPath
  : srcAnalyticsScriptsPath;
const { hasHttpsConfig, getHttpsOptions } = resolveHttpsConfiguration({
  sslPemPath,
  sslPfxPath,
  sslPfxPassphrase,
});
const httpsBaseUrl = `https://${publicHost}${httpsPort === 443 ? '' : `:${httpsPort}`}`;
const httpBaseUrl = `http://localhost:${httpPort}`;

async function warnIfPublicHostIsUnreachable() {
  const result = await checkPublicHostReachability(httpsBaseUrl, healthCheckPath);
  if (result.ok) {
    return;
  }

  const reason = result.error || `HTTP ${result.status || 'unknown'}`;
  logError(`[Backend health] ${httpsBaseUrl} is not reachable (${reason}).`);
  logError(
    '[Backend health] Please verify DNS/hosts mapping and local certificate trust for av-booking-local.newshore.es.'
  );
}

const renderIndexHtml = createRenderIndexHtml({
  port: httpPort,
  baseUrl: hasHttpsConfig ? httpsBaseUrl : httpBaseUrl,
  indexPath: distIndexPath,
  configDir,
  analyticsScriptsPath,
});

mountSharedRoutes(app, {
  healthCheckPath,
  countriesFlagsDir: srcCountriesFlagsDir,
  enableFakeApi,
  fakeApiLogLabel: '[Fake API] Enabled without prefix (backend)',
});

app.use(express.static(distDir));

app.get('*', (req, res) => {
  try {
    const html = renderIndexHtml(req.path);
    res.status(200).type('html').send(html);
  } catch (error) {
    console.error('Failed to render dist index with SEO/analytics:', error);
    res.status(500).send('Failed to render dist index');
  }
});

async function startBackendServers() {
  const httpPortCheck = await checkPortInUse(httpPort);
  if (httpPortCheck.inUse) {
    logError(`[Backend startup] HTTP port ${httpPort} is already in use (${httpBaseUrl}).`);
    return;
  }
  if (httpPortCheck.error) {
    logError(`[Backend startup] HTTP port check failed (${httpPort}): ${httpPortCheck.error}`);
  }

  const httpServer = http.createServer(app);
  httpServer.listen(httpPort, () => {
    console.log(`SPA server running on ${httpBaseUrl}`);
  });

  if (!hasHttpsConfig) {
    console.log('HTTPS disabled: server/cert/newshoreGeneral.pem or server/cert/newshoreGeneral.pfx not found.');
    return;
  }

  const httpsPortCheck = await checkPortInUse(httpsPort);
  if (httpsPortCheck.inUse) {
    logError(`[Backend startup] HTTPS port ${httpsPort} is already in use (${httpsBaseUrl}).`);
    return;
  }
  if (httpsPortCheck.error) {
    logError(`[Backend startup] HTTPS port check failed (${httpsPort}): ${httpsPortCheck.error}`);
  }

  try {
    const httpsOptions = getHttpsOptions();
    const httpsServer = https.createServer(httpsOptions, app);

    httpsServer.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`HTTPS startup failed: ${message}`);

      if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
        console.error(`Port ${httpsPort} is already in use.`);
      } else {
        console.error('Continuing with HTTP only.');
      }
    });

    httpsServer.listen(httpsPort, () => {
      console.log(`SPA server running on ${httpsBaseUrl}`);
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

void startBackendServers();
