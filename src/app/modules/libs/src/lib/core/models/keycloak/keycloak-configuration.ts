export interface KeycloakConfiguration {
  /**
   * Base URL of your Keycloak server (excluding `/realms`)
   */
  url: string;
  /**
   * The realm defined in your Keycloak configuration
   */
  realm: string;
  /**
   * The client ID registered in your realm (usually corresponds to your frontend app)
   */
  clientId: string;
  silentCheckSsoRedirectUri: string;
  enableLogging: boolean;
  logoutRetryAttempts: number;
}
