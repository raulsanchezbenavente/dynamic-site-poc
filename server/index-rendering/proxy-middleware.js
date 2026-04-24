const http = require('http');
const { createUmbracoProxyMiddleware } = require('../shared/umbraco-proxy-middleware');

function requestUpstreamHtml({ targetHost, targetPort, requestPath, headers }) {
  return new Promise((resolve, reject) => {
    const upstreamReq = http.request(
      {
        hostname: targetHost,
        port: targetPort,
        path: requestPath,
        method: 'GET',
        headers: {
          ...headers,
          host: `${targetHost}:${targetPort}`,
        },
      },
      (upstreamRes) => {
        const chunks = [];

        upstreamRes.on('data', (chunk) => {
          chunks.push(chunk);
        });

        upstreamRes.on('end', () => {
          if ((upstreamRes.statusCode || 500) >= 400) {
            reject(new Error(`Upstream HTML request failed with status ${upstreamRes.statusCode || 500}`));
            return;
          }

          resolve(Buffer.concat(chunks).toString('utf8'));
        });
      }
    );

    upstreamReq.on('error', reject);
    upstreamReq.end();
  });
}

function createIndexProxyMiddleware(options) {
  const { targetHost, targetPort, renderIndexHtml, umbracoTargetPort = 80, umbracoTargetHost = targetHost } = options;
  const umbracoProxyMiddleware = createUmbracoProxyMiddleware({
    targetHost: umbracoTargetHost,
    targetPort: umbracoTargetPort,
    preserveHostHeader: true,
  });

  return function indexProxyMiddleware(req, res) {
    umbracoProxyMiddleware(req, res, () => {
      const accept = String(req.headers.accept ?? '').toLowerCase();
      const isHtmlNavigation = req.method === 'GET' && accept.includes('text/html');
      const looksLikeAsset = /\.[a-z0-9]+$/i.test(req.path);

      if (isHtmlNavigation && !looksLikeAsset) {
        requestUpstreamHtml({
          targetHost,
          targetPort,
          requestPath: req.originalUrl,
          headers: req.headers,
        })
          .then((upstreamHtml) => {
            const html = renderIndexHtml(req.path, upstreamHtml);
            res.status(200).type('html').send(html);
          })
          .catch((error) => {
            try {
              const fallbackHtml = renderIndexHtml(req.path);
              res.status(200).type('html').send(fallbackHtml);
            } catch {
              console.error('Failed to render dynamic SEO HTML:', error);
              res.status(500).send('Failed to render proxy index with SEO');
            }
          });
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
          res.status(502).send(`Proxy error: upstream is not reachable on http://${targetHost}:${targetPort}`);
          return;
        }
        res.end();
      });

      req.pipe(proxyReq);
    });
  };
}

module.exports = {
  createIndexProxyMiddleware,
};
