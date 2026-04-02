import type { AccountInfo, AuthenticationTokenData, AuthService } from '@dcx/ui/libs';
import { AccountType } from '@dcx/ui/libs';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Returns a mock AuthService with configurable authentication state.
 */
export function StorybookAuthServiceMock({
  authenticated = false,
  delayMs = 1000,
}: {
  authenticated?: boolean;
  delayMs?: number;
} = {}): Partial<AuthService> {
  const MOCK_AUTHSERVICE_ACCOUNT_INFO: AccountInfo = {
    type: AccountType.MEMBER,
    username: 'mock.user',
    email: 'mock@user.com',
    firstName: 'Mock',
    lastName: 'User',
    cultureCode: 'es',
    isSocialMediaAccount: false,
    referenceId: 'ref123',
  };

  const MOCK_KEYCLOAK_CONFIG = {
    realm: 'mock-realm',
    clientId: 'mock-client',
    url: 'https://mock.auth.local',
    initOptions: { onLoad: 'check-sso' },
  };

  const MOCK_MOCK_AUTHSERVICE_TOKEN_DATA: AuthenticationTokenData = {
    token: 'mock-token',
    accountInfo: MOCK_AUTHSERVICE_ACCOUNT_INFO,
    createdAt: new Date(),
    refreshedAt: new Date(),
    refreshedTimes: 1,
    accountSettingsDto: undefined,
  };

  return {
    isAuthenticatedKeycloak$: (): Observable<boolean> => of(authenticated).pipe(delay(delayMs)),
    forceLogout$: (): Observable<boolean> => of(false).pipe(delay(delayMs)),
    expiredSession$: (): Observable<boolean> => of(false).pipe(delay(delayMs)),
    keycloakConfig$: (): Observable<any> => of(MOCK_KEYCLOAK_CONFIG).pipe(delay(delayMs)),

    isAuthenticated: (): boolean => authenticated,
    removeAuthenticationTokenData: (): void => {},
    saveAuthenticationTokenData: (): void => {},
    getAuthenticationTokenData: (): AuthenticationTokenData => MOCK_MOCK_AUTHSERVICE_TOKEN_DATA,
    login: (): void => console.log('[MOCK] Login called'),
    logout: (): void => {},
  };
}
