const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const { createIndexProxyMiddleware } = require('./index-rendering/proxy-middleware');
const { createRenderIndexHtml } = require('./index-rendering/render-context');

const app = express();
const httpPort = 4300;
const httpsPort = 443;
const publicHost = 'av-booking-local.newshore.es';
const indexPath = path.join(__dirname, '../src/index.html');
const analyticsScriptsPath = path.join(__dirname, '../src/assets/analytics/scripts');
const configDir = path.join(__dirname, '../src/assets/config-site');
const targetHost = 'localhost';
const targetPort = 4200;

const sslPfxPath = path.join(__dirname, 'cert', 'newshoreGeneral.pfx');
const sslPemPath = path.join(__dirname, 'cert', 'newshoreGeneral.pem');
const sslPfxPassphrase = '123456';

const hasPemHttpsConfig = fs.existsSync(sslPemPath);
const hasPfxHttpsConfig = fs.existsSync(sslPfxPath);
const hasHttpsConfig = hasPemHttpsConfig || hasPfxHttpsConfig;

const httpsBaseUrl = `https://${publicHost}${httpsPort === 443 ? '' : `:${httpsPort}`}`;
const httpBaseUrl = `http://localhost:${httpPort}`;
const renderIndexHtml = createRenderIndexHtml({
  port: httpPort,
  baseUrl: hasHttpsConfig ? httpsBaseUrl : httpBaseUrl,
  indexPath,
  configDir,
  analyticsScriptsPath,
});

app.use(
  createIndexProxyMiddleware({
    targetHost,
    targetPort,
    renderIndexHtml,
  })
);

http.createServer(app).listen(httpPort, () => {
  console.log(`Index server running on ${httpBaseUrl}`);
  console.log(`Forwarding assets/chunks to http://${targetHost}:${targetPort}`);
});

if (hasHttpsConfig) {
  try {
    let httpsOptions;

    if (hasPemHttpsConfig) {
      // Use PEM format (better compatibility)
      httpsOptions = {
        cert: fs.readFileSync(sslPemPath),
        key: fs.readFileSync(sslPemPath),
      };
    } else {
      // Fallback to PFX format
      httpsOptions = {
        pfx: fs.readFileSync(sslPfxPath),
        ...(sslPfxPassphrase ? { passphrase: sslPfxPassphrase } : {}),
      };
    }

    const httpsServer = https.createServer(httpsOptions, app);

    httpsServer.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`HTTPS startup failed: ${message}`);

      if (error && typeof error === 'object' && 'code' in error && error.code === 'EACCES' && httpsPort === 443) {
        console.error('Port 443 requires elevated bind permission on Linux.');
        console.error('Run `npm run linux:enable-port-443` once, then start the app again.');
      } else {
        console.error('Continuing with HTTP only.');
      }
    });

    httpsServer.listen(httpsPort, () => {
      console.log(`Index server running on ${httpsBaseUrl}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`HTTPS startup failed: ${message}`);
    console.error('Continuing with HTTP only.');
    console.error('If using PFX, verify the configured passphrase matches the certificate password.');
  }
} else {
  console.log('HTTPS disabled: server/cert/newshoreGeneral.pem or server/cert/newshoreGeneral.pfx not found.');
}
