const express = require('express');
const fs = require('fs');
const path = require('path');
const { createRenderIndexHtml } = require('./index-rendering/render-context');

const app = express();
const port = 4400;

const distDir = path.join(__dirname, '..', 'dist', 'dynamic-site', 'browser');
const distIndexPath = path.join(distDir, 'index.html');
const distAnalyticsScriptsPath = path.join(distDir, 'assets', 'analytics', 'scripts');
const srcAnalyticsScriptsPath = path.join(__dirname, '..', 'src', 'assets', 'analytics', 'scripts');
const distConfigDir = path.join(distDir, 'assets', 'config-site');
const srcConfigDir = path.join(__dirname, '..', 'src', 'assets', 'config-site');

const configDir = fs.existsSync(distConfigDir) ? distConfigDir : srcConfigDir;
const analyticsScriptsPath = fs.existsSync(distAnalyticsScriptsPath)
  ? distAnalyticsScriptsPath
  : srcAnalyticsScriptsPath;

const renderIndexHtml = createRenderIndexHtml({
  port,
  indexPath: distIndexPath,
  configDir,
  analyticsScriptsPath,
});

app.use(express.static(distDir));

app.get('*', (req, res) => {
  try {
    const html = renderIndexHtml(req.path);
    res.status(200).type('html').send(html);
  } catch (error) {
    console.error('Failed to render dist index with SEO/analytics:', error);
    res.status(500).send('Failed to render dist index');
  }
});

app.listen(port, () => {
  console.log(`SPA server running on http://localhost:${port}`);
});
