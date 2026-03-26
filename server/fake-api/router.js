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

function createFakeApiRouter(options = {}) {
  const { allowedOrigins = '*' } = options;

  const router = express.Router();

  router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  router.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'fake-api' });
  });

  router.get('/accounts/api/v2/session', (_req, res) => {
    sendJsonResponseFromFile(res, 'accounts/api/v2/session.json');
  });

  return router;
}

module.exports = {
  createFakeApiRouter,
};
