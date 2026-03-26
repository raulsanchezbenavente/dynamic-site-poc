const { randomUUID } = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const DEFAULT_STEP_ORDER = ['home', 'results', 'baggage-selection', 'seatmap', 'payment', 'payment-success'];
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

function normalizeToken(rawToken) {
  const token = String(rawToken || '').trim();
  if (!token) {
    return '';
  }

  if (token.toLowerCase().startsWith('bearer ')) {
    return token.slice('bearer '.length).trim();
  }

  return token;
}

function createFakeApiRouter(options = {}) {
  const {
    tokenTtlMs = 5 * 60 * 1000,
    stepOrder = DEFAULT_STEP_ORDER,
    allowedOrigins = '*',
  } = options;

  const router = express.Router();
  const purchaseState = new Map();

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

  router.post('/start', (_req, res) => {
    const token = randomUUID();

    purchaseState.set(token, {
      completed: new Set(),
      successViewed: false,
    });

    const timeout = setTimeout(() => {
      purchaseState.delete(token);
    }, tokenTtlMs);

    if (typeof timeout.unref === 'function') {
      timeout.unref();
    }

    res.status(200).json({ token });
  });

  router.post('/completeStep/:step', (req, res) => {
    const token = normalizeToken(req.headers.authorization);
    const step = req.params.step;
    const state = purchaseState.get(token);

    if (!state) {
      res.status(401).json({ error: 'Invalid or missing token' });
      return;
    }

    state.completed.add(step);

    if (step === 'payment-success') {
      state.successViewed = true;
    }

    res.status(200).json({ success: true });
  });

  router.get('/allowAccess/:step', (req, res) => {
    const token = normalizeToken(req.headers.authorization);
    const step = req.params.step;

    if (step === 'login') {
      res.status(200).json({ allowed: true });
      return;
    }

    const state = purchaseState.get(token);
    if (!state) {
      res.status(401).json({ allowed: false });
      return;
    }

    if (step === 'payment-success' && state.successViewed) {
      res.status(403).json({ allowed: false });
      return;
    }

    const index = stepOrder.indexOf(step);
    const requiredSteps = index > -1 ? stepOrder.slice(0, index) : stepOrder;
    const allowed = requiredSteps.every((item) => state.completed.has(item));

    if (allowed) {
      res.status(200).json({ allowed: true });
      return;
    }

    const nextStep = stepOrder.find((item) => !state.completed.has(item));
    res.status(200).json({ allowed: false, redirectTo: nextStep || 'home' });
  });

  router.delete('/destroy/:token', (req, res) => {
    const token = normalizeToken(req.params.token);
    purchaseState.delete(token);
    res.status(200).json({ success: true });
  });

  router.get('/session/:token', (req, res) => {
    const token = normalizeToken(req.params.token);
    const state = purchaseState.get(token);

    if (!state) {
      res.status(404).json({ found: false });
      return;
    }

    res.status(200).json({
      found: true,
      completed: Array.from(state.completed),
      successViewed: Boolean(state.successViewed),
    });
  });

  return router;
}

module.exports = {
  createFakeApiRouter,
};
