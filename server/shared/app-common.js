const fs = require('node:fs');
const https = require('node:https');
const express = require('express');
const { createFakeApiRouter } = require('../fake-api/router');

function mountSharedRoutes(app, options = {}) {
  const {
    healthCheckPath = '/__proxy-health',
    countriesFlagsDir,
    enableFakeApi = false,
    ssoBypassKeycloak = false,
    fakeApiLogLabel = '[Fake API] Enabled without prefix',
  } = options;

  app.get(healthCheckPath, (_req, res) => {
    res.status(200).type('text/plain').send('ok');
  });

  app.use('/static-config', (req, res) => {
    const upstreamReq = https.request(
      {
        hostname: 'av-static-dev3.newshore.es',
        method: req.method,
        path: `/static-config${req.url}`,
      },
      (upstreamRes) => {
        res.status(upstreamRes.statusCode || 502);

        Object.entries(upstreamRes.headers).forEach(([header, value]) => {
          if (value !== undefined) {
            res.setHeader(header, value);
          }
        });

        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on('error', (error) => {
      res.status(502).json({
        error: 'Static config upstream unavailable',
        details: error instanceof Error ? error.message : String(error),
      });
    });

    req.pipe(upstreamReq);
  });

  if (countriesFlagsDir && fs.existsSync(countriesFlagsDir)) {
    app.use('/ui/assets/ui_plus/imgs/countries-flags', express.static(countriesFlagsDir));
    app.use('/assets/ui_plus/imgs/countries-flags', express.static(countriesFlagsDir));
  }

  if (ssoBypassKeycloak) {
    app.get('/__sso-bypass/finalize', (req, res) => {
      const target = typeof req.query.target === 'string' ? req.query.target.trim() : '/';
      const maxAgeSec = Number(process.env.SSO_BYPASS_SESSION_TTL_MS || 8 * 60 * 60);
      const kySessionCookie = `KY_SESSION=true; Path=/; SameSite=Lax; Max-Age=${maxAgeSec}`;

      res.setHeader('Set-Cookie', kySessionCookie);
      res.redirect(target || '/');
    });
  }

  if (enableFakeApi) {
    app.use(express.json(), createFakeApiRouter({ ssoBypassKeycloak }));
    console.log(fakeApiLogLabel);
  }
}

module.exports = {
  mountSharedRoutes,
};
