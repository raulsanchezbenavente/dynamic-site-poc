export const environment = {
  production: false,
  bootLoaderMinDurationMs: 0,
  keycloak: {
    url: 'https://sso.lifemiles.net/auth',
    realm: 'lm-uat',
    clientId: 'avianca-web',
    useSilentCheckSso: false,
    silentCheckSsoRedirectUri: '/auth/silent-check-sso.html',
    enableLogging: false,
    logoutRetryAttempts: 0,
  },
};
