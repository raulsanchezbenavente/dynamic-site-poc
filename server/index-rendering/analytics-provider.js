const fs = require('fs');

function createAnalyticsScriptsProvider(options) {
  const { analyticsScriptsPath } = options;

  return function getAnalyticsScripts() {
    if (!analyticsScriptsPath || !fs.existsSync(analyticsScriptsPath)) {
      return '';
    }

    return fs.readFileSync(analyticsScriptsPath, 'utf8');
  };
}

module.exports = {
  createAnalyticsScriptsProvider,
};
