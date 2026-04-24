export const KEYCLOAK_CONSTANTS = {
  TOKEN_REFRESH_THRESHOLD: 30,
  EVENT_NOTIFICATION: 'eventNotification',
  LOGIN_STATUS_KEY: 'loginStatus',
  ACCOUNT_DATA_KEY: 'accountData',
  RETRY_LOGOUT: 'retryLogout',
  NEEDS_IDP_LOGOUT: 'needsIdpLogout',
  STORAGE_FLAG_VALUE: '1',
  STORAGE_FLAG_EXHAUSTED: '0',
  DEFAULT_INIT_OPTIONS: {
    onLoad: 'check-sso',
    responseMode: 'fragment',
    pkceMethod: 'S256',
    flow: 'standard',
  },
  TAB_SESSION_ID: 'tabSessionId',
};
