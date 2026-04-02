import { AccountClient, AccountV2Client } from "@dcx/module/api-clients";
import { KeycloakAuthService, AuthService } from "@dcx/ui/libs";
import { KeycloakService } from "keycloak-angular";
import { StorybookAuthServiceMock } from "./storybook-auth-service.mock";
import { Provider } from "@angular/core";


export const AUTH_STORYBOOK_PROVIDERS: Provider[] = [
  KeycloakService,
  KeycloakAuthService,
  AuthService,
  AccountV2Client,
  AccountClient,
  {
    provide: AuthService,
    useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 300 }),
  },
];
