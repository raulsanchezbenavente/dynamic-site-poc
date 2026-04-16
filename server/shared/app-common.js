const fs = require('fs');
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

  if (countriesFlagsDir && fs.existsSync(countriesFlagsDir)) {
    app.use('/ui/assets/ui_plus/imgs/countries-flags', express.static(countriesFlagsDir));
    app.use('/assets/ui_plus/imgs/countries-flags', express.static(countriesFlagsDir));
  }

  if (enableFakeApi) {
    app.use(express.json(), createFakeApiRouter({ ssoBypassKeycloak }));
    console.log(fakeApiLogLabel);
  }
}

module.exports = {
  mountSharedRoutes,
};
