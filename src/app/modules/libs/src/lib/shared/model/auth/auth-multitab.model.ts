import { KeycloakEventType } from 'keycloak-angular';

export interface MultitabAuthMessage {
  type: KeycloakEventType;
  shouldRedirect: boolean;
  tabId?: string;
  timestamp: number;
  preLogout: boolean;
}
