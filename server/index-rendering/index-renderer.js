const fs = require('fs');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createIndexHtmlRenderer(options) {
  const { indexPath, renderSeoTags, getAnalyticsScripts = () => '' } = options;

  const titleTagRegex = /<title[^>]*>[\s\S]*?<\/title>/i;
  const disableSeoMetaRegex = /<meta\s+name=["']disable-dynamic-seo["'][^>]*>/i;
  const stylesLinkRegex = /<link\s+[^>]*href=["']styles\.css["'][^>]*>/i;
  const appRootTag = '<app-root></app-root>';
  const bootScripts = '<script src="polyfills.js" type="module"></script><script src="main.js" type="module"></script>';

  return function renderIndexHtml(requestPath) {
    const template = fs.readFileSync(indexPath, 'utf8');
    const seo = renderSeoTags(requestPath);
    const analyticsScripts = getAnalyticsScripts();

    let html = template;

    if (titleTagRegex.test(html)) {
      html = html.replace(titleTagRegex, `<title>${escapeHtml(seo.title)}</title>`);
    }

    if (!disableSeoMetaRegex.test(html)) {
      const disableSeoTag = '        <meta name="disable-dynamic-seo" content="true" />';
      if (html.includes('</title>')) {
        html = html.replace('</title>', `</title>\n${disableSeoTag}`);
      } else {
        html = html.replace('</head>', `${disableSeoTag}\n    </head>`);
      }
    }

    html = html.replace('<!-- DYNAMIC_ANALYTICS_SCRIPTS -->', analyticsScripts);
    html = html.replace('<!-- DYNAMIC_SEO_TAGS_SSR -->', seo.tags);

    if (!stylesLinkRegex.test(html)) {
      const stylesTag = '    <link rel="stylesheet" href="styles.css">';
      html = html.replace('</head>', `${stylesTag}\n    </head>`);
    }

    if (html.includes(appRootTag) && !html.includes(bootScripts)) {
      html = html.replace(appRootTag, `${appRootTag}\n    ${bootScripts}`);
    }

    return html;
  };
}

module.exports = {
  createIndexHtmlRenderer,
};
