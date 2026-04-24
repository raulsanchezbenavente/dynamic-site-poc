const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const responsesDir = path.join(__dirname, 'responses');
const staticConfigurationDir = path.join(responsesDir, 'configuration');
const staticConfigDir = path.join(responsesDir, 'static-config');

function jsonStaticOptions() {
  return {
    setHeaders: (res, filePath) => {
      if (!path.extname(filePath)) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
    },
  };
}

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

function getSingleQueryString(value, fallback = '') {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return fallback;
}

function resolvePointOfSalesResponseFile(cultureQuery) {
  const rawCulture = getSingleQueryString(cultureQuery, 'en').trim();
  const safeCulture = rawCulture.replaceAll(/[^a-zA-Z-]/g, '');
  const normalizedCulture = safeCulture || 'en';
  const baseCulture = normalizedCulture.split('-')[0] || normalizedCulture;

  const candidates = [normalizedCulture, normalizedCulture.toLowerCase(), baseCulture.toLowerCase(), 'en'];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const culture of uniqueCandidates) {
    const relativePath = `config/PointOfSales_${culture}.json`;
    const absolutePath = path.join(responsesDir, relativePath);
    if (fs.existsSync(absolutePath)) {
      return relativePath;
    }
  }

  return 'config/PointOfSales_en.json';
}

function resolveTranslationResponseFile(cultureQuery) {
  const rawCulture = getSingleQueryString(cultureQuery, '').trim();
  const safeCulture = rawCulture.replaceAll(/[^a-zA-Z-]/g, '');
  const normalizedCulture = safeCulture;
  const baseCulture = normalizedCulture.split('-')[0] || normalizedCulture;

  const candidates = [normalizedCulture, normalizedCulture.toLowerCase(), baseCulture.toLowerCase()];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const culture of uniqueCandidates) {
    const relativePath = `translation/GetByCultureAndKeys_${culture}.json`;
    const absolutePath = path.join(responsesDir, relativePath);
    if (fs.existsSync(absolutePath)) {
      return relativePath;
    }
  }

  return 'translation/GetByCultureAndKeys.json';
}

function withDelay(handler) {
  return (req, res) => {
    setTimeout(() => handler(req, res), 350);
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

  router.use('/configuration', express.static(staticConfigurationDir, jsonStaticOptions()));
  router.use('/static-config', express.static(staticConfigDir));

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

  router.get('/booking/api/v1/booking/findFlights', (_req, res) => {
    sendJsonResponseFromFile(res, 'booking/api/v1/findFlights.get.json');
  });

  router.get('/configuration/api/v1/UI_PLUS/Config/PointOfSales', (req, res) => {
    sendJsonResponseFromFile(res, resolvePointOfSalesResponseFile(req.query.culture));
  });

  router.get('/configuration/api/v1/Countries', (req, res) => {
    const culture = getSingleQueryString(req.query.culture, 'en-US');
    sendJsonResponseFromFile(res, `config/Countries_${culture}.json`);
  });

  router.get('/configuration/api/v1/UI_PLUS/Translation/GetByCultureAndKeys', (req, res) => {
    sendJsonResponseFromFile(res, resolveTranslationResponseFile(req.query.culture));
  });

  router.get('/configuration/api/v1/UI_PLUS/Config/get', (req, res) => {
    let key = '';
    if (typeof req.query.key === 'string') {
      key = req.query.key.trim();
    } else if (Array.isArray(req.query.key) && typeof req.query.key[0] === 'string') {
      key = req.query.key[0].trim();
    }

    const isBypassKeycloakConfig = ssoBypassKeycloak && key === 'common_KeycloakConfiguration';
    const isBypassEndpointsConfig = ssoBypassKeycloak && key === 'common_EndpointsConfiguration';
    let relativeConfigPath = `config/${key}.json`;
    if (isBypassKeycloakConfig) {
      relativeConfigPath = 'config/common_KeycloakConfiguration.sso-bypass.json';
    } else if (isBypassEndpointsConfig) {
      relativeConfigPath = 'config/common_EndpointsConfiguration_bypass.json';
    }
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
