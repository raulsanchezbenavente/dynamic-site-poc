const fs = require('fs');
const http = require('http');
const https = require('https');

function formatErrorLog(message) {
  if (process.env.NO_COLOR) {
    return `[ERROR] ${message}`;
  }
  return `\u001b[31m[ERROR] ${message}\u001b[0m`;
}

function logError(message) {
  // Some launchers only preserve ANSI colors consistently on stdout.
  console.log(formatErrorLog(message));
}

function checkPortInUse(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer();

    tester.once('error', (error) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;

      if (code === 'EADDRINUSE') {
        resolve({ inUse: true });
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      resolve({ inUse: false, error: message });
    });

    tester.once('listening', () => {
      tester.close(() => resolve({ inUse: false }));
    });

    tester.listen(port, host);
  });
}

function checkPublicHostReachability(baseUrl, healthCheckPath, timeoutMs = 3500) {
  return new Promise((resolve) => {
    const target = new URL(baseUrl);
    const client = target.protocol === 'https:' ? https : http;
    const isHttps = target.protocol === 'https:';
    const req = client.request(
      {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: healthCheckPath,
        method: 'GET',
        timeout: timeoutMs,
        ...(isHttps ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        const status = Number(res.statusCode || 0);
        res.resume();
        resolve({ ok: status >= 200 && status < 500, status });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`timeout after ${timeoutMs}ms`));
    });

    req.on('error', (error) => {
      resolve({ ok: false, error: error instanceof Error ? error.message : String(error) });
    });

    req.end();
  });
}

function resolveHttpsConfiguration({ sslPemPath, sslPfxPath, sslPfxPassphrase }) {
  const hasPemHttpsConfig = fs.existsSync(sslPemPath);
  const hasPfxHttpsConfig = fs.existsSync(sslPfxPath);
  const hasHttpsConfig = hasPemHttpsConfig || hasPfxHttpsConfig;

  const getHttpsOptions = () => {
    if (!hasHttpsConfig) {
      return null;
    }

    if (hasPemHttpsConfig) {
      return {
        cert: fs.readFileSync(sslPemPath),
        key: fs.readFileSync(sslPemPath),
      };
    }

    return {
      pfx: fs.readFileSync(sslPfxPath),
      ...(sslPfxPassphrase ? { passphrase: sslPfxPassphrase } : {}),
    };
  };

  return {
    hasPemHttpsConfig,
    hasPfxHttpsConfig,
    hasHttpsConfig,
    getHttpsOptions,
  };
}

module.exports = {
  checkPortInUse,
  checkPublicHostReachability,
  formatErrorLog,
  logError,
  resolveHttpsConfiguration,
};
