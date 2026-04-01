import { KeycloakEventType } from 'keycloak-angular';

export type EventHandler = (event: KeycloakAuthEvent) => void;

export interface KeycloakAuthEvent {
  type: KeycloakEventType;
  isActionTab: boolean;
  preLogout: boolean;
}

export interface LoginStatusData {
  isLoggedIn: boolean;
}
