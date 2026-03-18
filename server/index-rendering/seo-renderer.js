const fs = require('fs');
const path = require('path');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePath(rawPath) {
  const decoded = decodeURIComponent(String(rawPath ?? '/')).trim();
  if (!decoded || decoded === '/') return '/';
  const withSlash = decoded.startsWith('/') ? decoded : `/${decoded}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

function createSeoRenderer(options) {
  const { configDir, siteName, supportedLangs, localeByLang, baseUrl, fallbackPath = '/es/inicio' } = options;

  function readSiteConfig(lang) {
    const filePath = path.join(configDir, lang);
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.pages) ? parsed.pages : [];
  }

  function buildConfigSnapshot() {
    const byPath = new Map();
    const byLangAndPageId = new Map();

    for (const lang of supportedLangs) {
      const pages = readSiteConfig(lang);
      const pageById = new Map();

      pages.forEach((page) => {
        const pageId = String(page?.pageId ?? '').trim();
        const rawPath = String(page?.path ?? '').trim();
        const normalized = normalizePath(rawPath);

        if (normalized !== '/') {
          byPath.set(normalized, { lang, page });
        }

        if (pageId) {
          pageById.set(pageId, page);
        }
      });

      byLangAndPageId.set(lang, pageById);
    }

    return { byPath, byLangAndPageId };
  }

  function resolvePageForPath(config, requestPath) {
    const normalized = normalizePath(requestPath);
    const directMatch = config.byPath.get(normalized);
    if (directMatch) {
      return { ...directMatch, resolvedPath: normalized };
    }

    const fallback = config.byPath.get(fallbackPath);
    if (fallback) {
      return { ...fallback, resolvedPath: fallbackPath };
    }

    return {
      lang: 'es',
      page: {
        pageId: '0',
        path: fallbackPath.replace(/^\//, ''),
        name: siteName,
        seo: {
          title: siteName,
          description: '',
          robots: 'index,follow',
        },
      },
      resolvedPath: fallbackPath,
    };
  }

  function buildAlternates(config, pageId, canonicalPath) {
    if (!pageId) {
      return [{ lang: 'x-default', href: canonicalPath }];
    }

    const result = [];

    for (const lang of supportedLangs) {
      const page = config.byLangAndPageId.get(lang)?.get(pageId);
      const normalized = normalizePath(page?.path ?? '');
      if (normalized !== '/') {
        result.push({ lang, href: normalized });
      }
    }

    if (!result.length) {
      result.push({ lang: 'es', href: canonicalPath });
    }

    const xDefault = result.find((item) => item.lang === 'es') ?? result[0];
    result.push({ lang: 'x-default', href: xDefault.href });

    return result;
  }

  return function renderSeoTags(requestPath) {
    const config = buildConfigSnapshot();
    const matched = resolvePageForPath(config, requestPath);
    const page = matched.page ?? {};
    const pageId = String(page?.pageId ?? '').trim();

    const seo = page?.seo ?? {};
    const title = String(seo?.title ?? page?.name ?? siteName).trim() || siteName;
    const description = String(seo?.description ?? '').trim();
    const robots = String(seo?.robots ?? 'index,follow').trim() || 'index,follow';

    const canonicalPath = matched.resolvedPath;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const alternates = buildAlternates(config, pageId, canonicalPath);

    const altLinks = alternates
      .map(
        (alt) =>
          `        <link rel="alternate" hreflang="${escapeHtml(alt.lang)}" href="${baseUrl}${escapeHtml(alt.href)}"/>`
      )
      .join('\n');

    const locale = localeByLang[matched.lang] ?? 'es_ES';

    const tags = [
      `        <meta name="description" content="${escapeHtml(description)}"/>`,
      `        <meta name="robots" content="${escapeHtml(robots)}"/>`,
      `        <link rel="canonical" href="${escapeHtml(canonicalUrl)}"/>`,
      altLinks,
      '        <meta property="og:type" content="website"/>',
      `        <meta property="og:site_name" content="${escapeHtml(siteName)}"/>`,
      `        <meta property="og:title" content="${escapeHtml(title)}"/>`,
      `        <meta property="og:description" content="${escapeHtml(description)}"/>`,
      `        <meta property="og:url" content="${escapeHtml(canonicalUrl)}"/>`,
      `        <meta property="og:locale" content="${escapeHtml(locale)}"/>`,
      '        <meta name="twitter:card" content="summary_large_image"/>',
      `        <meta name="twitter:title" content="${escapeHtml(title)}"/>`,
      `        <meta name="twitter:description" content="${escapeHtml(description)}"/>`,
    ].join('\n');

    return { title, tags };
  };
}

module.exports = {
  createSeoRenderer,
};
