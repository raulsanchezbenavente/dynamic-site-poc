const path = require('path');
const express = require('express');
const { createIndexProxyMiddleware } = require('./index-rendering/proxy-middleware');
const { createRenderIndexHtml } = require('./index-rendering/render-context');

const app = express();
const port = 4300;
const indexPath = path.join(__dirname, '../src/index.html');
const analyticsScriptsPath = path.join(__dirname, '../src/assets/analytics/scripts');
const configDir = path.join(__dirname, '../src/assets/config-site');
const targetHost = 'localhost';
const targetPort = 4200;
const renderIndexHtml = createRenderIndexHtml({
  port,
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

app.listen(port, () => {
  console.log(`Index server running on http://localhost:${port}`);
});
