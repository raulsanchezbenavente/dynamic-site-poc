const path = require('path');
const http = require('http');
const express = require('express');

const app = express();
const port = 4300;
const indexPath = path.join(__dirname, 'index.html');
const targetHost = 'localhost';
const targetPort = 4200;

app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(indexPath);
});

app.use((req, res) => {
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
