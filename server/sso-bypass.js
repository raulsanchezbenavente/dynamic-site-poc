const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL, URLSearchParams } = require('url');

const port = Number(process.env.SSO_BYPASS_PORT || 4500);
const issuerHost = process.env.SSO_BYPASS_HOST || `http://localhost:${port}`;
const authBasePath = '/auth';
const defaultRealm = process.env.SSO_BYPASS_REALM || 'lm-uat';
const sessionCookieName = 'SSO_BYPASS_SESSION';
const sessionTtlMs = Number(process.env.SSO_BYPASS_SESSION_TTL_MS || 8 * 60 * 60 * 1000);
const loginTemplatePath = path.join(__dirname, 'templates', 'sso-login.html');
const useTemplateCache = String(process.env.SSO_BYPASS_TEMPLATE_CACHE || 'false').toLowerCase() === 'true';
const supportedLoginLangs = new Set(['en', 'es', 'fr', 'pt']);
const defaultLoginLang = 'en';
const loginI18n = {
  en: {
    pageTitle: 'FakeMiles Access',
    heading: 'Sign in to your account',
    subtitle: 'SSO local dev. Any username and password are accepted in this local bypass mode.',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    signInLabel: 'Sign In',
    hint: 'After sign-in, you will be redirected automatically to the provided redirect_uri.',
  },
  es: {
    pageTitle: 'Acceso FakeMiles',
    heading: 'Inicia sesion en tu cuenta',
    subtitle: 'SSO local de desarrollo. En este modo bypass local se acepta cualquier usuario y contrasena.',
    usernameLabel: 'Usuario',
    passwordLabel: 'Contrasena',
    signInLabel: 'Iniciar sesion',
    hint: 'Despues del inicio de sesion seras redirigido automaticamente al redirect_uri indicado.',
  },
  fr: {
    pageTitle: 'Acces FakeMiles',
    heading: 'Connectez-vous a votre compte',
    subtitle: 'SSO local de developpement. Tout identifiant et mot de passe sont acceptes dans ce mode bypass local.',
    usernameLabel: 'Identifiant',
    passwordLabel: 'Mot de passe',
    signInLabel: 'Se connecter',
    hint: 'Apres connexion, vous serez redirige automatiquement vers le redirect_uri fourni.',
  },
  pt: {
    pageTitle: 'Acesso FakeMiles',
    heading: 'Entre na sua conta',
    subtitle: 'SSO local de desenvolvimento. Qualquer usuario e senha sao aceitos neste modo de bypass local.',
    usernameLabel: 'Usuario',
    passwordLabel: 'Senha',
    signInLabel: 'Entrar',
    hint: 'Apos o login, voce sera redirecionado automaticamente para o redirect_uri informado.',
  },
};

const authorizationCodes = new Map();
const refreshTokens = new Map();
const sessions = new Map();
const clientSessions = new Map();
let cachedLoginTemplate = null;

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

const setCookie = (res, name, value, maxAgeSeconds) => {
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
  res.setHeader('Set-Cookie', cookie);
};

const clearCookie = (res, name) => {
  res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
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

const createRefreshTokenJwt = ({ realm, clientId, subject, username, expiresInSeconds }) => {
  const nowSec = Math.floor(Date.now() / 1000);
  return createUnsignedJwt({
    iss: `${issuerHost}${authBasePath}/realms/${realm}`,
    aud: clientId,
    sub: subject,
    preferred_username: username,
    typ: 'Refresh',
    iat: nowSec,
    exp: nowSec + expiresInSeconds,
    jti: crypto.randomUUID(),
  });
};

const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  const allowOrigin = origin || 'http://localhost:4200';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Max-Age', '600');
};

const resolveRealm = (pathname) => {
  const match = pathname.match(/^\/auth\/realms\/([^/]+)/);
  return match?.[1] || defaultRealm;
};

const parseCookies = (req) => {
  const raw = req.headers.cookie || '';
  if (!raw) return {};

  return raw.split(';').reduce((acc, token) => {
    const [name, ...rest] = token.trim().split('=');
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
};

const getActiveSession = (req) => {
  const cookies = parseCookies(req);
  const sessionId = cookies[sessionCookieName];
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return { sessionId, session };
};

const buildClientSessionKey = (realm, clientId) => `${String(realm || defaultRealm)}::${String(clientId || '')}`;

const getActiveClientSession = ({ realm, clientId }) => {
  const key = buildClientSessionKey(realm, clientId);
  const sessionId = clientSessions.get(key);
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    clientSessions.delete(key);
    if (sessionId) {
      sessions.delete(sessionId);
    }
    return null;
  }

  return { sessionId, session };
};

const getActiveSessionForRequest = (req, { realm, clientId }) => {
  const cookieSession = getActiveSession(req);
  if (cookieSession) {
    return cookieSession;
  }

  return getActiveClientSession({ realm, clientId });
};

const createAuthorizationCodeForSession = ({
  username,
  clientId,
  redirectUri,
  scope,
  nonce,
  codeChallenge,
  codeChallengeMethod,
  realm,
}) => {
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

  return code;
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

const escapeHtmlAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const loadLoginTemplate = () => {
  if (useTemplateCache && cachedLoginTemplate) {
    return cachedLoginTemplate;
  }

  const template = fs.readFileSync(loginTemplatePath, 'utf8');
  if (useTemplateCache) {
    cachedLoginTemplate = template;
  }
  return template;
};

const normalizeLanguageCode = (value) => {
  const input = String(value || '')
    .trim()
    .toLowerCase();

  if (!input) {
    return null;
  }

  const normalized = input.replace('_', '-').split('-')[0];
  return supportedLoginLangs.has(normalized) ? normalized : null;
};

const pickLanguageFromList = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const candidates = raw
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const normalized = normalizeLanguageCode(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const resolveLanguageFromRedirectUri = (redirectUri) => {
  const uri = String(redirectUri || '').trim();
  if (!uri) {
    return null;
  }

  try {
    const parsed = new URL(uri);
    const segment = parsed.pathname.split('/').filter(Boolean)[0] || '';
    return normalizeLanguageCode(segment);
  } catch {
    return null;
  }
};

const resolveLoginLanguage = ({ uiLocales, kcLocale, redirectUri, acceptLanguage }) => {
  return (
    pickLanguageFromList(uiLocales) ||
    normalizeLanguageCode(kcLocale) ||
    resolveLanguageFromRedirectUri(redirectUri) ||
    pickLanguageFromList(
      String(acceptLanguage || '')
        .split(',')
        .map((entry) => entry.split(';')[0])
        .join(' ')
    ) ||
    defaultLoginLang
  );
};

const buildLoginPage = (params, options = {}) => {
  const lang = normalizeLanguageCode(options.lang) || defaultLoginLang;
  const i18n = loginI18n[lang] || loginI18n[defaultLoginLang];

  const hiddenFields = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtmlAttr(key)}" value="${escapeHtmlAttr(value)}">`)
    .join('\n');

  return loadLoginTemplate()
    .replace('__AUTH_ACTION__', `${authBasePath}/dev-login`)
    .replace('{{AUTH_ACTION}}', `${authBasePath}/dev-login`)
    .replace('__HIDDEN_FIELDS__', hiddenFields)
    .replace('{{HIDDEN_FIELDS}}', hiddenFields)
    .replace(/{{I18N_LANG}}/g, escapeHtmlAttr(lang))
    .replace(/{{I18N_PAGE_TITLE}}/g, escapeHtmlAttr(i18n.pageTitle))
    .replace(/{{I18N_HEADING}}/g, escapeHtmlAttr(i18n.heading))
    .replace(/{{I18N_SUBTITLE}}/g, escapeHtmlAttr(i18n.subtitle))
    .replace(/{{I18N_USERNAME_LABEL}}/g, escapeHtmlAttr(i18n.usernameLabel))
    .replace(/{{I18N_PASSWORD_LABEL}}/g, escapeHtmlAttr(i18n.passwordLabel))
    .replace(/{{I18N_SIGNIN_LABEL}}/g, escapeHtmlAttr(i18n.signInLabel))
    .replace(/{{I18N_HINT}}/g, escapeHtmlAttr(i18n.hint));
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
  const mode = String(responseMode || 'query')
    .trim()
    .toLowerCase();
  if (mode === 'fragment') {
    return appendFragmentToUri(uri, params);
  }
  return appendQueryToUri(uri, params);
};

const buildFinalizeRedirectUrl = (targetRedirectUri) => {
  const redirectTarget = String(targetRedirectUri || '').trim();
  if (!redirectTarget) {
    return '/';
  }

  try {
    const target = new URL(redirectTarget);
    const finalizeUrl = new URL('/__sso-bypass/finalize', target.origin);
    finalizeUrl.searchParams.set('target', redirectTarget);
    return finalizeUrl.toString();
  } catch {
    return redirectTarget;
  }
};

const normalizeUriForComparison = (rawUri) => {
  const input = String(rawUri || '').trim();
  if (!input) {
    return '';
  }

  try {
    const parsed = new URL(input);
    parsed.hash = '';
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return input;
  }
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
  const uiLocales = query.get('ui_locales') || '';
  const kcLocale = query.get('kc_locale') || '';
  const realm = resolveRealm(urlObj.pathname);
  const prompt = query.get('prompt') || '';
  const loginLang = resolveLoginLanguage({
    uiLocales,
    kcLocale,
    redirectUri,
    acceptLanguage: req.headers['accept-language'] || '',
  });
  const activeSession = getActiveSessionForRequest(req, { realm, clientId });

  if (!redirectUri) {
    sendJson(res, 400, { error: 'invalid_request', error_description: 'redirect_uri is required' });
    return;
  }

  if (prompt === 'none') {
    if (activeSession) {
      const code = createAuthorizationCodeForSession({
        username: activeSession.session.username,
        clientId,
        redirectUri,
        scope,
        nonce,
        codeChallenge,
        codeChallengeMethod,
        realm,
      });
      const redirectTo = appendAuthResponseToUri(
        redirectUri,
        { code, state, session_state: activeSession.sessionId },
        responseMode
      );
      redirect(res, redirectTo);
      return;
    }

    const redirectTo = appendAuthResponseToUri(redirectUri, { error: 'login_required', state }, responseMode);
    redirect(res, redirectTo);
    return;
  }

  if (activeSession) {
    const code = createAuthorizationCodeForSession({
      username: activeSession.session.username,
      clientId,
      redirectUri,
      scope,
      nonce,
      codeChallenge,
      codeChallengeMethod,
      realm,
    });
    const redirectTo = appendAuthResponseToUri(
      redirectUri,
      { code, state, session_state: activeSession.sessionId },
      responseMode
    );
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
    login_lang: loginLang,
    ui_locales: uiLocales,
    kc_locale: kcLocale,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  }, { lang: loginLang });
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

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    username,
    realm,
    clientId,
    scope,
    expiresAt: Date.now() + sessionTtlMs,
  });
  clientSessions.set(buildClientSessionKey(realm, clientId), sessionId);
  setCookie(res, sessionCookieName, sessionId, Math.floor(sessionTtlMs / 1000));

  const code = createAuthorizationCodeForSession({
    username,
    clientId,
    redirectUri,
    scope,
    nonce,
    codeChallenge,
    codeChallengeMethod,
    realm,
  });

  const redirectTo = appendAuthResponseToUri(redirectUri, { code, state, session_state: sessionId }, responseMode);
  redirect(res, buildFinalizeRedirectUrl(redirectTo));
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
    const renewedRefreshToken = createRefreshTokenJwt({
      realm: existing.realm,
      clientId: existing.clientId,
      subject: existing.subject,
      username: existing.username,
      expiresInSeconds: 3600,
    });

    refreshTokens.delete(refreshToken);
    refreshTokens.set(renewedRefreshToken, {
      ...existing,
      expiresAt: Date.now() + 3600 * 1000,
    });

    sendJson(res, 200, {
      access_token: accessToken,
      refresh_token: renewedRefreshToken,
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

  const authRedirectUri = normalizeUriForComparison(authData.redirectUri);
  const requestRedirectUri = normalizeUriForComparison(redirectUri);
  const isClientCompatible = !clientId || authData.clientId === clientId;
  const isRedirectCompatible = !requestRedirectUri || authRedirectUri === requestRedirectUri;

  if (!isRedirectCompatible || !isClientCompatible) {
    sendJson(res, 400, { error: 'invalid_grant', error_description: 'Mismatched client or redirect URI' });
    return;
  }

  if (authData.codeChallenge && authData.codeChallengeMethod === 'S256' && codeVerifier) {
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
  const refreshToken = createRefreshTokenJwt({
    realm: authData.realm,
    clientId: authData.clientId,
    subject,
    username: authData.username,
    expiresInSeconds: 3600,
  });

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

const handleLogoutRequest = (req, res, urlObj) => {
  const realm = resolveRealm(urlObj.pathname);
  const clientId =
    urlObj.searchParams.get('client_id') || urlObj.searchParams.get('clientId') || urlObj.searchParams.get('azp') || '';
  const activeSession = getActiveSessionForRequest(req, { realm, clientId });
  if (activeSession) {
    sessions.delete(activeSession.sessionId);
    if (clientId) {
      clientSessions.delete(buildClientSessionKey(realm, clientId));
    }
  }
  clearCookie(res, sessionCookieName);

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

    if (
      req.method === 'GET' &&
      pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/3p-cookies/step1.html`
    ) {
      sendHtml(res, 200, build3pCookiesProbePage('step1', realm));
      return;
    }

    if (
      req.method === 'GET' &&
      pathname === `${authBasePath}/realms/${realm}/protocol/openid-connect/3p-cookies/step2.html`
    ) {
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
      handleLogoutRequest(req, res, urlObj);
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
  console.log(
    `[SSO BYPASS] auth endpoint: ${issuerHost}${authBasePath}/realms/${defaultRealm}/protocol/openid-connect/auth`
  );
  console.log('[SSO BYPASS] accepts any credentials and redirects to redirect_uri');
});
