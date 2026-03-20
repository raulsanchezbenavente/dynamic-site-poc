const { createAnalyticsScriptsProvider } = require('./analytics-provider');
const { createIndexHtmlRenderer } = require('./index-renderer');
const { createSeoRenderer } = require('./seo-renderer');

const defaultSiteOptions = {
  siteName: 'Avianca',
  supportedLangs: ['es', 'en', 'fr', 'pt'],
  localeByLang: {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    pt: 'pt_PT',
  },
};

function createRenderIndexHtml(options) {
  const { port, baseUrl, indexPath, configDir, analyticsScriptsPath, siteOptions = {} } = options;
  const resolvedSiteOptions = { ...defaultSiteOptions, ...siteOptions };

  const renderSeoTags = createSeoRenderer({
    configDir,
    siteName: resolvedSiteOptions.siteName,
    supportedLangs: resolvedSiteOptions.supportedLangs,
    localeByLang: resolvedSiteOptions.localeByLang,
    baseUrl: baseUrl || `http://localhost:${port}`,
  });

  const getAnalyticsScripts = createAnalyticsScriptsProvider({
    analyticsScriptsPath,
  });

  return createIndexHtmlRenderer({
    indexPath,
    renderSeoTags,
    getAnalyticsScripts,
  });
}

module.exports = {
  createRenderIndexHtml,
};
