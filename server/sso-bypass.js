const crypto = require('crypto');
const http = require('http');
const { URL, URLSearchParams } = require('url');

const port = Number(process.env.SSO_BYPASS_PORT || 4500);
const issuerHost = process.env.SSO_BYPASS_HOST || `http://localhost:${port}`;
const authBasePath = '/auth';
const defaultRealm = process.env.SSO_BYPASS_REALM || 'lm-uat';

const authorizationCodes = new Map();
const refreshTokens = new Map();

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
  res.end(body);
};

const sendHtml = (res, status, html) => {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
  res.end(html);
};

const redirect = (res, to) => {
  res.writeHead(302, { Location: to });
  res.end();
};

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === 'string' ? value : JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createUnsignedJwt = (payload) => {
  const header = { alg: 'none', typ: 'JWT' };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
};

const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  const allowOrigin = origin || '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
};

const resolveRealm = (pathname) => {
  const match = pathname.match(/^\/auth\/realms\/([^/]+)/);
  return match?.[1] || defaultRealm;
};

const createOidcMetadata = (realm) => {
  const issuer = `${issuerHost}${authBasePath}/realms/${realm}`;
  return {
    issuer,
    authorization_endpoint: `${issuer}/protocol/openid-connect/auth`,
    token_endpoint: `${issuer}/protocol/openid-connect/token`,
    userinfo_endpoint: `${issuer}/protocol/openid-connect/userinfo`,
    end_session_endpoint: `${issuer}/protocol/openid-connect/logout`,
    jwks_uri: `${issuer}/protocol/openid-connect/certs`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['none'],
    scopes_supported: ['openid', 'profile', 'email'],
    claims_supported: ['sub', 'name', 'preferred_username', 'email'],
  };
};

const buildLoginPage = (params) => {
  const hiddenFields = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${String(key)}" value="${String(value).replace(/"/g, '&quot;')}">`
    )
    .join('\n');

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SSO Bypass Login</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(145deg, #f5f1e8, #dfe7ed);
      }
      .card {
        width: min(420px, 92vw);
        padding: 24px;
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 12px 40px rgba(22, 28, 45, 0.15);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
      }
      p {
        margin: 0 0 18px;
        color: #3d4957;
      }
      label {
        display: block;
        margin: 12px 0 6px;
        font-weight: 600;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #c8d3df;
        border-radius: 8px;
      }
      button {
        margin-top: 16px;
        width: 100%;
        border: 0;
        border-radius: 10px;
        padding: 12px;
        font-weight: 700;
        color: #fff;
        background: #0f355e;
        cursor: pointer;
      }
      .hint {
        margin-top: 12px;
        font-size: 12px;
        color: #55606f;
      }
    </style>
  </head>
  <body>
    <form class="card" method="post" action="${authBasePath}/dev-login">
      <h1>SSO Bypass</h1>
      <p>Entorno local: se acepta cualquier credencial.</p>
      ${hiddenFields}
      <label for="username">Usuario</label>
      <input id="username" name="username" type="text" value="developer" autocomplete="username">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" value="dev" autocomplete="current-password">
      <button type="submit">Entrar</button>
      <div class="hint">Tras login se redirige automáticamente al redirect_uri recibido.</div>
    </form>
  </body>
</html>`;
};

const appendQueryToUri = (uri, params) => {
  const target = new URL(uri);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      target.searchParams.set(key, String(value));
    }
  });
  return target.toString();
};

const appendFragmentToUri = (uri, params) => {
  const target = new URL(uri);
  const fragment = target.hash?.startsWith('#') ? target.hash.slice(1) : target.hash;
  const fragmentParams = new URLSearchParams(fragment || '');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fragmentParams.set(key, String(value));
    }
  });

  target.hash = fragmentParams.toString();
  return target.toString();
};

const appendAuthResponseToUri = (uri, params, responseMode) => {
  const mode = String(responseMode || 'query').trim().toLowerCase();
  if (mode === 'fragment') {
    return appendFragmentToUri(uri, params);
  }
  return appendQueryToUri(uri, params);
};

const build3pCookiesProbePage = (step, realm) => {
  const step2Path = `${authBasePath}/realms/${realm}/protocol/openid-connect/3p-cookies/step2.html`;

  if (step === 'step1') {
    return `<!doctype html>
<html>
  <body>
    <script>
      document.cookie = 'KEYCLOAK_3P_COOKIE_SAMESITE=supported; Max-Age=60; Path=/; SameSite=None';
      document.cookie = 'KEYCLOAK_3P_COOKIE=supported; Max-Age=60; Path=/';
      window.location.href = '${step2Path}';
    </script>
  </body>
</html>`;
  }

  return `<!doctype html>
<html>
  <body>
    <script>
      var hasCookie = document.cookie.indexOf('KEYCLOAK_3P_COOKIE') !== -1;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(hasCookie ? 'supported' : 'unsupported', '*');
      }
    </script>
  </body>
</html>`;
};

const handleAuthorizeRequest = (req, res, urlObj) => {
  const query = urlObj.searchParams;
  const redirectUri = query.get('redirect_uri') || '';
  const state = query.get('state') || '';
  const clientId = query.get('client_id') || '';
  const scope = query.get('scope') || 'openid profile email';
  const responseType = query.get('response_type') || 'code';
  const nonce = query.get('nonce') || '';
  const codeChallenge = query.get('code_challenge') || '';
  const codeChallengeMethod = query.get('code_challenge_method') || '';
  const responseMode = query.get('response_mode') || 'query';
  const realm = resolveRealm(urlObj.pathname);
  const prompt = query.get('prompt') || '';

  if (!redirectUri) {
    sendJson(res, 400, { error: 'invalid_request', error_description: 'redirect_uri is required' });
    return;
  }

  if (prompt === 'none') {
    const redirectTo = appendAuthResponseToUri(redirectUri, { error: 'login_required', state }, responseMode);
    redirect(res, redirectTo);
    return;
  }

  const loginPage = buildLoginPage({
    realm,
    redirect_uri: redirectUri,
    state,
    client_id: clientId,
    scope,
    response_type: responseType,
    nonce,
    response_mode: responseMode,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  });
  sendHtml(res, 200, loginPage);
};

const handleDevLoginPost = async (req, res) => {
  const rawBody = await readRequestBody(req);
  const body = new URLSearchParams(rawBody);

  const username = body.get('username') || 'developer';
  const redirectUri = body.get('redirect_uri') || '';
  const state = body.get('state') || '';
  const clientId = body.get('client_id') || '';
  const scope = body.get('scope') || 'openid profile email';
  const nonce = body.get('nonce') || '';
  const codeChallenge = body.get('code_challenge') || '';
  const codeChallengeMethod = body.get('code_challenge_method') || '';
  const responseMode = body.get('response_mode') || 'query';
  const realm = body.get('realm') || defaultRealm;

  if (!redirectUri) {
    sendJson(res, 400, { error: 'invalid_request', error_description: 'redirect_uri is required' });
    return;
  }

  const code = crypto.randomBytes(16).toString('hex');
  authorizationCodes.set(code, {
    username,
    clientId,
    redirectUri,
    scope,
    nonce,
    codeChallenge,
    codeChallengeMethod,
    realm,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const redirectTo = appendAuthResponseToUri(redirectUri, { code, state, session_state: crypto.randomUUID() }, responseMode);
  redirect(res, redirectTo);
};

const handleTokenRequest = async (req, res) => {
  const rawBody = await readRequestBody(req);
  const body = new URLSearchParams(rawBody);
  const grantType = body.get('grant_type') || '';

  if (grantType === 'refresh_token') {
    const refreshToken = body.get('refresh_token') || '';
    const existing = refreshTokens.get(refreshToken);
    if (!existing || existing.expiresAt < Date.now()) {
      sendJson(res, 400, { error: 'invalid_grant', error_description: 'Invalid refresh token' });
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const accessToken = createUnsignedJwt({
      iss: `${issuerHost}${authBasePath}/realms/${existing.realm}`,
      aud: existing.clientId,
      sub: existing.subject,
      preferred_username: existing.username,
      exp: nowSec + 300,
      iat: nowSec,
    });

    sendJson(res, 200, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 300,
      refresh_expires_in: 3600,
      scope: existing.scope,
    });
    return;
  }

  if (grantType !== 'authorization_code') {
    sendJson(res, 400, { error: 'unsupported_grant_type' });
    return;
  }

  const code = body.get('code') || '';
  const redirectUri = body.get('redirect_uri') || '';
  const clientId = body.get('client_id') || '';
  const codeVerifier = body.get('code_verifier') || '';

  const authData = authorizationCodes.get(code);
  if (!authData || authData.expiresAt < Date.now()) {
    sendJson(res, 400, { error: 'invalid_grant', error_description: 'Invalid code' });
    return;
  }

  authorizationCodes.delete(code);

  if (authData.redirectUri !== redirectUri || authData.clientId !== clientId) {
    sendJson(res, 400, { error: 'invalid_grant', error_description: 'Mismatched client or redirect URI' });
    return;
  }

  if (authData.codeChallenge && authData.codeChallengeMethod === 'S256') {
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    if (hashed !== authData.codeChallenge) {
      sendJson(res, 400, { error: 'invalid_grant', error_description: 'PKCE validation failed' });
      return;
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const subject = crypto.randomUUID();
  const accessToken = createUnsignedJwt({
    iss: `${issuerHost}${authBasePath}/realms/${authData.realm}`,
    aud: authData.clientId,
    sub: subject,
    preferred_username: authData.username,
    exp: nowSec + 300,
    iat: nowSec,
  });
  const idToken = createUnsignedJwt({
    iss: `${issuerHost}${authBasePath}/realms/${authData.realm}`,
    aud: authData.clientId,
    sub: subject,
    preferred_username: authData.username,
    nonce: authData.nonce || undefined,
    exp: nowSec + 300,
    iat: nowSec,
  });
  const refreshToken = crypto.randomBytes(24).toString('hex');

  refreshTokens.set(refreshToken, {
    username: authData.username,
    clientId: authData.clientId,
    realm: authData.realm,
    scope: authData.scope,
    subject,
    expiresAt: Date.now() + 3600 * 1000,
  });

  sendJson(res, 200, {
    access_token: accessToken,
    id_token: idToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 300,
    refresh_expires_in: 3600,
    scope: authData.scope,
    session_state: crypto.randomUUID(),
  });
};

const handleLogoutRequest = (res, urlObj) => {
  const redirectUri =
    urlObj.searchParams.get('redirect_uri') || urlObj.searchParams.get('post_logout_redirect_uri') || '/';
  redirect(res, redirectUri);
};

const server = http.createServer(async (req, res) => {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!req.url) {
    sendJson(res, 404, { error: 'not_found' });
    return;
  }

  const urlObj = new URL(req.url, issuerHost);
  const pathname = urlObj.pathname;
  const realm = resolveRealm(pathname);

  try {
    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/.well-known/openid-configuration`) {
      sendJson(res, 200, createOidcMetadata(realm));
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/certs`) {
      sendJson(res, 200, { keys: [] });
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/3p-cookies/step1.html`) {
      sendHtml(res, 200, build3pCookiesProbePage('step1', realm));
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/3p-cookies/step2.html`) {
      sendHtml(res, 200, build3pCookiesProbePage('step2', realm));
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/userinfo`) {
      sendJson(res, 200, {
        sub: 'local-dev-user',
        preferred_username: 'developer',
        email: 'developer@local.test',
        name: 'Local Developer',
      });
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/auth`) {
      handleAuthorizeRequest(req, res, urlObj);
      return;
    }

    if (req.method === 'POST' && pathname === `${authBasePath}/dev-login`) {
      await handleDevLoginPost(req, res);
      return;
    }

    if (req.method === 'POST' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/token`) {
      await handleTokenRequest(req, res);
      return;
    }

    if (req.method === 'GET' && pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/logout`) {
      handleLogoutRequest(res, urlObj);
      return;
    }

    sendJson(res, 404, { error: 'not_found', path: pathname });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 500, { error: 'server_error', message });
  }
});

server.listen(port, () => {
  console.log(`[SSO BYPASS] running on ${issuerHost}`);
  console.log(`[SSO BYPASS] auth endpoint: ${issuerHost}${authBasePath}/realms/${defaultRealm}/protocol/openid-connect/auth`);
  console.log('[SSO BYPASS] accepts any credentials and redirects to redirect_uri');
});
