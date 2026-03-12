const express = require('express');
const path = require('path');

const app = express();
const port = 4400;

const distDir = path.join(__dirname, '..', 'dist', 'dynamic-site', 'browser');

app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`SPA server running on http://localhost:${port}`);
});
