import { KeycloakAuthService } from '../../services';

export function initializeKeycloakFactory(keycloakAuthService: KeycloakAuthService) {
  return (): Promise<void> => {
    setTimeout(() => {
      keycloakAuthService.initialize().catch((error) => {
        console.error('Error initializing Keycloak:', error);
      });
    }, 0);
    return Promise.resolve();
  };
}
