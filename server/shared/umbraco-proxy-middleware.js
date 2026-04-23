const http = require('http');

const UMBRACO_PATH_REGEX = /^(?:\/umbraco(?:\/|$)|\/app_plugins(?:\/|$))/i;

function isUmbracoPath(pathname) {
  return UMBRACO_PATH_REGEX.test(String(pathname || ''));
}

function createUmbracoProxyMiddleware(options) {
  const { targetHost, targetPort = 80, preserveHostHeader = true } = options;

  return function umbracoProxyMiddleware(req, res, next) {
    if (!isUmbracoPath(req.path)) {
      if (typeof next === 'function') {
        next();
      }
      return;
    }

    const upstreamHostHeader = preserveHostHeader
      ? String(req.headers.host ?? `${targetHost}`)
      : `${targetHost}:${targetPort}`;

    const proxyReq = http.request(
      {
        hostname: targetHost,
        port: targetPort,
        path: req.originalUrl,
        method: req.method,
        headers: {
          ...req.headers,
          host: upstreamHostHeader,
        },
      },
      (proxyRes) => {
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
        res.status(502).send(`Proxy error: upstream is not reachable on http://${targetHost}:${targetPort}`);
        return;
      }
      res.end();
    });

    req.pipe(proxyReq);
  };
}

module.exports = {
  createUmbracoProxyMiddleware,
  isUmbracoPath,
};
