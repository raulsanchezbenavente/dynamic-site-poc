const path = require('path');
const express = require('express');
const { createAnalyticsScriptsProvider } = require('./index-proxy/analytics-provider');
const { createIndexHtmlRenderer } = require('./index-proxy/index-renderer');
const { createIndexProxyMiddleware } = require('./index-proxy/proxy-middleware');
const { createSeoRenderer } = require('./index-proxy/seo-renderer');

const app = express();
const port = 4300;
const indexPath = path.join(__dirname, '../src/index.html');
const analyticsScriptsPath = path.join(__dirname, '../src/assets/analytics/scripts');
const configDir = path.join(__dirname, '../src/assets/config-site');
const targetHost = 'localhost';
const targetPort = 4200;
const siteName = 'Avianca';
const supportedLangs = ['es', 'en', 'fr', 'pt'];
const localeByLang = {
  es: 'es_ES',
  en: 'en_US',
  fr: 'fr_FR',
  pt: 'pt_PT',
};

const renderSeoTags = createSeoRenderer({
  configDir,
  siteName,
  supportedLangs,
  localeByLang,
  baseUrl: `http://localhost:${port}`,
});

const getAnalyticsScripts = createAnalyticsScriptsProvider({
  analyticsScriptsPath,
});

const renderIndexHtml = createIndexHtmlRenderer({
  indexPath,
  renderSeoTags,
  getAnalyticsScripts,
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
