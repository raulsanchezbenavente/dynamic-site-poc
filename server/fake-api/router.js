const express = require('express');
const fs = require('fs');
const path = require('path');

const responsesDir = path.join(__dirname, 'responses');

function readJsonResponse(relativeFilePath) {
  const filePath = path.join(responsesDir, relativeFilePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function sendJsonResponseFromFile(res, relativeFilePath) {
  try {
    const payload = readJsonResponse(relativeFilePath);
    res.status(200).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: {
        code: 'FAKE_API_RESPONSE_FILE_ERROR',
        description: `Could not read fake API response file: ${relativeFilePath}`,
        trace: message,
      },
      success: false,
      result: null,
    });
  }
}

function withDelay(handler) {
  return (req, res) => {
    setTimeout(() => handler(req, res), 250);
  };
}

function createFakeApiRouter(options = {}) {
  const { allowedOrigins = '*', ssoBypassKeycloak = false } = options;

  const router = express.Router();

  router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  router.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'fake-api' });
  });

  router.get(
    '/accounts/api/v2/session',
    withDelay((_req, res) => {
      sendJsonResponseFromFile(res, 'accounts/api/v2/session.json');
    })
  );

  router.patch(
    '/accounts/api/v2/session',
    withDelay((_req, res) => {
      sendJsonResponseFromFile(res, 'accounts/api/v2/session.patch.json');
    })
  );

  router.patch(
    '/accounts/api/v2/account/travelDocuments',
    withDelay((_req, res) => {
      sendJsonResponseFromFile(res, 'accounts/api/v2/travel-documents.patch.json');
    })
  );

  router.patch(
    '/accounts/api/v1/account/updateEmergencyContact',
    withDelay((_req, res) => {
      sendJsonResponseFromFile(res, 'accounts/api/v1/update-emergency-contact.patch.json');
    })
  );

  router.get('/LoyaltyPrograms', (_req, res) => {
    sendJsonResponseFromFile(res, 'loyalty-programs.json');
  });

  router.get('/booking/api/v1/booking/findFlights', (_req, res) => {
    sendJsonResponseFromFile(res, 'booking/api/v1/findFlights.get.json');
  });

  router.get('/configuration/api/v1/UI_PLUS/Config/AnalyticsSettings', (_req, res) => {
    sendJsonResponseFromFile(res, 'config/AnalyticsSettings.json');
  });

  router.get('/AnalyticsSettings', (_req, res) => {
    sendJsonResponseFromFile(res, 'config/AnalyticsSettings.json');
  });

  router.get('/configuration/api/v1/UI_PLUS/Config/PointOfSales', (req, res) => {
    const culture = req.query.culture || 'en';
    sendJsonResponseFromFile(res, `config/PointOfSales_${culture}.json`);
  });

  router.get('/PointOfSales', (req, res) => {
    const culture = req.query.culture || 'en';
    sendJsonResponseFromFile(res, `config/PointOfSales_${culture}.json`);
  });

  router.get('/configuration/api/v1/Countries', (req, res) => {
    const culture = req.query.culture || 'en-US';
    sendJsonResponseFromFile(res, `config/Countries_${culture}.json`);
  });

  router.get('/configuration/api/v1/UI_PLUS/Translation/GetByCultureAndKeys', (_req, res) => {
    sendJsonResponseFromFile(res, 'translation/GetByCultureAndKeys.json');
  });

  router.get('/configuration/api/v1/UI_PLUS/Config/get', (req, res) => {
    let key = '';
    if (typeof req.query.key === 'string') {
      key = req.query.key.trim();
    } else if (Array.isArray(req.query.key) && typeof req.query.key[0] === 'string') {
      key = req.query.key[0].trim();
    }

    const isBypassKeycloakConfig = ssoBypassKeycloak && key === 'common_KeycloakConfiguration';
    const relativeConfigPath = isBypassKeycloakConfig
      ? 'config/common_KeycloakConfiguration.sso-bypass.json'
      : `config/${key}.json`;
    const filePath = path.join(responsesDir, relativeConfigPath);

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      if (!raw.trim()) {
        res.status(204).end();
        return;
      }
      res.status(200).json(JSON.parse(raw));
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: `No fake response for key: ${key}`, path: filePath });
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: {
          code: 'FAKE_API_RESPONSE_FILE_ERROR',
          description: `Could not read fake API response file: ${relativeConfigPath}`,
          trace: message,
        },
        success: false,
        result: null,
      });
    }
  });

  return router;
}

module.exports = {
  createFakeApiRouter,
};
