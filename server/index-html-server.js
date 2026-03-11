const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');

const app = express();
const port = 4300;
const indexPath = path.join(__dirname, 'index.html');
const configDir = path.join(__dirname, '../src/assets/config-site');
const targetHost = 'localhost';
const targetPort = 4200;
const siteName = 'Avianca';
const supportedLangs = ['es', 'en', 'fr', 'pt'];
const localeByLang = {
  es: 'es_ES',
  en: 'en_US',
  fr: 'fr_FR',
  pt: 'pt_PT'
};

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

function readSiteConfig(lang) {
  const filePath = path.join(configDir, lang);
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];
  return pages;
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

  const fallback = config.byPath.get('/es/inicio');
  if (fallback) {
    return { ...fallback, resolvedPath: '/es/inicio' };
  }

  return {
    lang: 'es',
    page: {
      pageId: '0',
      path: 'es/inicio',
      name: siteName,
      seo: {
        title: siteName,
        description: '',
        robots: 'index,follow'
      }
    },
    resolvedPath: '/es/inicio'
  };
}

function buildAlternates(config, pageId, fallbackPath) {
  if (!pageId) {
    return [{ lang: 'x-default', href: fallbackPath }];
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
    result.push({ lang: 'es', href: fallbackPath });
  }

  const xDefault = result.find((a) => a.lang === 'es') ?? result[0];
  result.push({ lang: 'x-default', href: xDefault.href });
  return result;
}

function renderSeoTags(reqPath) {
  const config = buildConfigSnapshot();
  const matched = resolvePageForPath(config, reqPath);
  const page = matched.page ?? {};
  const pageId = String(page?.pageId ?? '').trim();

  const seo = page?.seo ?? {};
  const title = String(seo?.title ?? page?.name ?? siteName).trim() || siteName;
  const description = String(seo?.description ?? '').trim();
  const robots = String(seo?.robots ?? 'index,follow').trim() || 'index,follow';

  const canonicalPath = matched.resolvedPath;
  const canonicalUrl = `http://localhost:${port}${canonicalPath}`;
  const alternates = buildAlternates(config, pageId, canonicalPath);

  const altLinks = alternates
    .map((alt) => `        <link rel="alternate" hreflang="${escapeHtml(alt.lang)}" href="http://localhost:${port}${escapeHtml(alt.href)}"/>`)
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
    `        <meta name="twitter:description" content="${escapeHtml(description)}"/>`
  ].join('\n');

  return { title, tags };
}

function renderIndexHtml(reqPath) {
  const template = fs.readFileSync(indexPath, 'utf8');
  const seo = renderSeoTags(reqPath);

  return template
    .replace('__SEO_TITLE__', escapeHtml(seo.title))
    .replace('<!-- DYNAMIC_SEO_TAGS -->', seo.tags);
}

app.use((req, res) => {
  const accept = String(req.headers.accept ?? '').toLowerCase();
  const isHtmlNavigation = req.method === 'GET' && accept.includes('text/html');
  const looksLikeAsset = /\.[a-z0-9]+$/i.test(req.path);

  if (isHtmlNavigation && !looksLikeAsset) {
    try {
      const html = renderIndexHtml(req.path);
      res.status(200).type('html').send(html);
    } catch (error) {
      console.error('Failed to render dynamic SEO HTML:', error);
      res.status(500).send('Failed to render proxy index with SEO');
    }
    return;
  }

  const proxyReq = http.request(
    {
      hostname: targetHost,
      port: targetPort,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${targetHost}:${targetPort}`
      }
    },
    proxyRes => {
      res.status(proxyRes.statusCode || 502);

      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });

      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.status(502).send('Proxy error: angular dev server is not reachable on http://localhost:4200');
      return;
    }
    res.end();
  });

  req.pipe(proxyReq);
});

app.listen(port, () => {
  console.log(`Index server running on http://localhost:${port}`);
});
