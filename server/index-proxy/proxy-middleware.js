const http = require('http');

function createIndexProxyMiddleware(options) {
  const { targetHost, targetPort, renderIndexHtml } = options;

  return function indexProxyMiddleware(req, res) {
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
          host: `${targetHost}:${targetPort}`,
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
        res.status(502).send(`Proxy error: angular dev server is not reachable on http://${targetHost}:${targetPort}`);
        return;
      }
      res.end();
    });

    req.pipe(proxyReq);
  };
}

module.exports = {
  createIndexProxyMiddleware,
};
