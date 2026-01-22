const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// In-memory purchase state (token -> completed steps)
const purchaseState = new Map();

const stepOrder = [
    'home',
    'results',
    'baggage-selection',
    'seatmap',
    'payment',
    'payment-success'
];

// 🎯 1. Start a new purchase and return a token
app.post('/start', (req, res) => {
    const token = uuidv4();
    purchaseState.set(token, {
        completed: new Set(),
        successViewed: false
    });

    // ⏱️ Automatically expire the token after 5 minutes
    setTimeout(() => {
        purchaseState.delete(token);
        console.log(`⏳ Token expired and removed: ${token}`);
    }, 5 * 60 * 1000); // 5 min

    res.json({ token });
});

// 🎯 2. Mark a step as completed
app.post('/completeStep/:step', (req, res) => {
    const token = req.headers['authorization'];
    const step = req.params.step;
    const state = purchaseState.get(token);

    if (!state) {
        return res.status(401).json({ error: 'Invalid or missing token' });
    }

    state.completed.add(step);

    if (step === 'payment-success') {
        state.successViewed = true;
    }

    res.json({ success: true });
});

// 🎯 3. Check if a step is accessible
app.get('/allowAccess/:step', (req, res) => {
    const token = req.headers['authorization'];
    const step = req.params.step;

    // ✅ Always allow access to login (or any other public path)
    if (step === 'login') {
        return res.json({ allowed: true });
    }

    const state = purchaseState.get(token);
    if (!state) {
        return res.status(401).json({ allowed: false });
    }

    if (step === 'payment-success' && state.successViewed) {
        return res.status(403).json({ allowed: false });
    }

    const index = stepOrder.indexOf(step);
    const requiredSteps = stepOrder.slice(0, index);

    const allowed = requiredSteps.every(s => state.completed.has(s));
    if (allowed) {
        return res.json({ allowed: true });
    }

    const nextStep = stepOrder.find(s => !state.completed.has(s));
    return res.json({ allowed: false, redirectTo: nextStep || 'home' });
});

// 🎯 4. Destroy the purchase process
app.delete('/destroy/:token', (req, res) => {
    const token = req.params.token;
    purchaseState.delete(token);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`✅ Purchase process API running on http://localhost:${port}`);
});

const path = require('path');

app.get('/assets/config-site.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/assets/config-site.json'));
});

const browserPath = path.join(__dirname, '../dist/dynamic-site/browser');

app.use(express.static(browserPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(browserPath, 'index.html'));
});
