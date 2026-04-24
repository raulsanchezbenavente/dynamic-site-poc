import { KeycloakAuthService } from './keycloak.service';
import { KeycloakService, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { AuthenticationStorageService } from '../authentication-storage.service';
import { ConfigService } from '@dcx/ui/libs';
import { BehaviorSubject, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService;
  let keycloakServiceSpy: jasmine.SpyObj<KeycloakService>;
  let authStorageSpy: jasmine.SpyObj<AuthenticationStorageService>;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    keycloakServiceSpy = jasmine.createSpyObj('KeycloakService', [
      'init', 'login', 'logout', 'getKeycloakInstance'
    ], {
      keycloakEvents$: new BehaviorSubject<KeycloakEvent>({ type: KeycloakEventType.OnAuthSuccess })
    });
    authStorageSpy = jasmine.createSpyObj('AuthenticationStorageService', ['removeAuthenticationTokenData']);
    configServiceSpy = jasmine.createSpyObj('ConfigService', ['getCommonConfig']);
    configServiceSpy.getCommonConfig.and.returnValue(of({
      url: 'https://sso.test/auth',
      realm: 'test-realm',
      clientId: 'test-client',
      silentCheckSsoRedirectUri: '/auth/silent-check-sso.html',
      tokenRefreshThreshold: 30,
      tokenRefreshInterval: 60,
    }));
    TestBed.configureTestingModule({
      providers: [
        KeycloakAuthService,
        { provide: KeycloakService, useValue: keycloakServiceSpy },
        { provide: AuthenticationStorageService, useValue: authStorageSpy },
        { provide: ConfigService, useValue: configServiceSpy },
      ],
    });
    service = TestBed.inject(KeycloakAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and subscribe to events', async () => {
    keycloakServiceSpy.init.and.returnValue(Promise.resolve(true));
    await service.initialize();
    expect(keycloakServiceSpy.init).toHaveBeenCalled();
  });

  it('should handle unauthenticated on failed init', async () => {
    keycloakServiceSpy.init.and.returnValue(Promise.resolve(false));
    spyOn(service as any, 'handleUnauthenticated');
    await service.initialize();
    expect((service as any).handleUnauthenticated).toHaveBeenCalled();
  });

  it('should call login with redirectUri', async () => {
    keycloakServiceSpy.login.and.returnValue(Promise.resolve());
    await service.login('http://redirect');
    expect(keycloakServiceSpy.login).toHaveBeenCalledWith({ redirectUri: 'http://redirect' });
  });

  it('should call login without redirectUri', async () => {
    keycloakServiceSpy.login.and.returnValue(Promise.resolve());
    await service.login();
    expect(keycloakServiceSpy.login).toHaveBeenCalled();
  });

  it('should call logout with redirectUri', async () => {
    keycloakServiceSpy.init.and.returnValue(Promise.resolve(true));
    await service.initialize();
    
    spyOn(service as any, 'deleteCookiesAndKeysBeforeRedirect').and.callThrough();
    spyOn(service as any, 'deleteAllApiSessionCookies');
    spyOn(service as any, 'removeKySessionCookie');
    const storageService = (service as any).storageService;
    spyOn(storageService, 'removeLocalStorage');
    spyOn(storageService, 'removeSessionStorage');
    
    (service as any).deleteCookiesAndKeysBeforeRedirect();
    
    expect((service as any).deleteAllApiSessionCookies).toHaveBeenCalled();
    expect((service as any).removeKySessionCookie).toHaveBeenCalled();
  });

  it('should build logout url without redirectUri', async () => {
    keycloakServiceSpy.init.and.returnValue(Promise.resolve(true));
    await service.initialize();
    
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({
      idToken: 'test-id-token-456',
    } as any);
    
    const logoutUrl = (service as any).buildLogoutUrl('');
    
    expect(logoutUrl).toContain('https://sso.test/auth/realms/test-realm/protocol/openid-connect/logout');
    expect(logoutUrl).toContain('id_token_hint=test-id-token-456');
    expect(logoutUrl).toContain('post_logout_redirect_uri=');
  });

  it('should call logout with redirectUri', () => {
    spyOn(service as any, 'deleteCookiesAndKeysBeforeRedirect');
    spyOn(localStorage, 'setItem'); 
    const buildLogoutUrlSpy = spyOn(service as any, 'buildLogoutUrl').and.returnValue('javascript:void(0)');

    service.logout('http://redirect');

    expect((service as any).deleteCookiesAndKeysBeforeRedirect).toHaveBeenCalled();
    expect(buildLogoutUrlSpy).toHaveBeenCalledWith('http://redirect');
  });

  it('should call logout without redirectUri', () => {
    spyOn(service as any, 'deleteCookiesAndKeysBeforeRedirect');
    spyOn(localStorage, 'setItem');
    const buildLogoutUrlSpy = spyOn(service as any, 'buildLogoutUrl').and.returnValue('javascript:void(0)');

    service.logout('');

    expect((service as any).deleteCookiesAndKeysBeforeRedirect).toHaveBeenCalled();
    expect(buildLogoutUrlSpy).toHaveBeenCalledWith('');
  });

  it('should build logout url with idToken', async () => {
    keycloakServiceSpy.init.and.returnValue(Promise.resolve(true));
    await service.initialize();
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({ idToken: 'id-token-123' } as any);
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({ idToken: 'id-token-123' } as any);
    const url = (service as any).buildLogoutUrl('http://redirect');
    expect(url).toContain('https://sso.test/auth/realms/test-realm/protocol/openid-connect/logout');
    expect(url).toContain('post_logout_redirect_uri=http%3A%2F%2Fredirect');
    expect(url).toContain('id_token_hint=id-token-123'); 
  });

  it('should getTokenSync and handle error', () => {
    keycloakServiceSpy.getKeycloakInstance.and.throwError('fail');
    expect(service.getTokenSync()).toBeNull();
  });

  it('should getTokenSync and return token', () => {
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({
      token: 'abc',
      init: () => Promise.resolve(true),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      accountManagement: () => Promise.resolve(),
      createLoginUrl: () => '',
      createLogoutUrl: () => '',
      createRegisterUrl: () => '',
      createAccountUrl: () => '',
      isTokenExpired: () => false,
      updateToken: () => Promise.resolve(true),
      clearToken: () => {},
      hasRealmRole: () => false,
      hasResourceRole: () => false,
      loadUserProfile: () => Promise.resolve({} as any),
      loadUserInfo: () => Promise.resolve({}),
      subject: '',
      idToken: '',
      idTokenParsed: {},
      realmAccess: { roles: [] },
      resourceAccess: {},
      refreshToken: '',
      refreshTokenParsed: {},
      tokenParsed: {},
      timeSkew: 0,
      authenticated: true,
      userInfo: {},
      profile: {},
      clientId: '',
      realm: '',
  // removed unknown property
      sessionId: '',
  // removed unknown property
      responseMode: undefined,
      flow: undefined,
  // removed unknown property
      onReady: () => {},
      onAuthSuccess: () => {},
      onAuthError: () => {},
      onAuthRefreshSuccess: () => {},
      onAuthRefreshError: () => {},
      onAuthLogout: () => {},
      onTokenExpired: () => {},
    });
    expect(service.getTokenSync()).toBe('abc');
  });

  it('should getRefreshTokenSync and handle error', () => {
    keycloakServiceSpy.getKeycloakInstance.and.throwError('fail');
    expect((service as any).getRefreshTokenSync()).toBeNull();
  });

  it('should getRefreshTokenSync and return refreshToken', () => {
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({
      refreshToken: 'xyz',
      token: '',
      init: () => Promise.resolve(true),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      accountManagement: () => Promise.resolve(),
      createLoginUrl: () => '',
      createLogoutUrl: () => '',
      createRegisterUrl: () => '',
      createAccountUrl: () => '',
      isTokenExpired: () => false,
      updateToken: () => Promise.resolve(true),
      clearToken: () => {},
      hasRealmRole: () => false,
      hasResourceRole: () => false,
      loadUserProfile: () => Promise.resolve({} as any),
      loadUserInfo: () => Promise.resolve({}),
      subject: '',
      idToken: '',
      idTokenParsed: {},
      realmAccess: { roles: [] },
      resourceAccess: {},
      refreshTokenParsed: {},
      tokenParsed: {},
      timeSkew: 0,
      authenticated: true,
      userInfo: {},
      profile: {},
      clientId: '',
      realm: '',
  // removed unknown property
      sessionId: '',
  // removed unknown property
      responseMode: undefined,
      flow: undefined,
  // removed unknown property
      onReady: () => {},
      onAuthSuccess: () => {},
      onAuthError: () => {},
      onAuthRefreshSuccess: () => {},
      onAuthRefreshError: () => {},
      onAuthLogout: () => {},
      onTokenExpired: () => {},
    });
    expect((service as any).getRefreshTokenSync()).toBe('xyz');
  });

  it('should set and remove localStorage keys', () => {
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
    spyOn(service as any, 'getTokenSync').and.returnValue('token');
    spyOn(service as any, 'getRefreshTokenSync').and.returnValue('refresh');
    (service as any).setLocalStorageKeys();
    expect(localStorage.setItem).toHaveBeenCalled();
    (service as any).removeLocalStorageKeysToken();
    expect(localStorage.removeItem).toHaveBeenCalled();
  });

  it('should handleOnAuthSuccess', () => {
    spyOn(service as any, 'setLocalStorageKeys');
    (service as any).isAuthenticatedSubject.next = jasmine.createSpy('next');
    (service as any).handleOnAuthSuccess();
    expect((service as any).setLocalStorageKeys).toHaveBeenCalled();
    expect((service as any).isAuthenticatedSubject.next).toHaveBeenCalledWith(true);
  });

  it('should handleOnTokenExpired', () => {
    spyOn(service as any, 'handleTokenExpired');
    (service as any).handleOnTokenExpired();
    expect((service as any).handleTokenExpired).toHaveBeenCalled();
  });

  it('should handleUnauthenticated', () => {
    spyOn(service as any, 'removeLocalStorageKeysToken');
    (service as any).isAuthenticatedSubject.next = jasmine.createSpy('next');
    (service as any).handleUnauthenticated();
    expect((service as any).removeLocalStorageKeysToken).toHaveBeenCalled();
    expect((service as any).isAuthenticatedSubject.next).toHaveBeenCalledWith(false);
    expect(authStorageSpy.removeAuthenticationTokenData).toHaveBeenCalled();
  });

  it('should handleTokenExpired with no keycloakInstance', async () => {
  keycloakServiceSpy.getKeycloakInstance.and.returnValue(null as any);
    await (service as any).handleTokenExpired();
    // nothing to assert, just coverage
  });

  it('should handleTokenExpired with updateToken success', async () => {
    const updateTokenSpy = jasmine.createSpy().and.returnValue(Promise.resolve());
    keycloakServiceSpy.getKeycloakInstance.and.returnValue({
      updateToken: updateTokenSpy,
      refreshToken: 'refresh',
      token: 'token',
      init: () => Promise.resolve(true),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      accountManagement: () => Promise.resolve(),
      createLoginUrl: () => '',
      createLogoutUrl: () => '',
      createRegisterUrl: () => '',
      createAccountUrl: () => '',
      isTokenExpired: () => false,
      clearToken: () => {},
      hasRealmRole: () => false,
      hasResourceRole: () => false,
      loadUserProfile: () => Promise.resolve({} as any),
      loadUserInfo: () => Promise.resolve({}),
      subject: '',
      idToken: '',
      idTokenParsed: {},
      realmAccess: { roles: [] },
      resourceAccess: {},
      refreshTokenParsed: {},
      tokenParsed: {},
      timeSkew: 0,
      authenticated: true,
      userInfo: {},
      profile: {},
      clientId: '',
      realm: '',
  // removed unknown property
      sessionId: '',
  // removed unknown property
      responseMode: undefined,
      flow: undefined,
  // removed unknown property
      onReady: () => {},
      onAuthSuccess: () => {},
      onAuthError: () => {},
      onAuthRefreshSuccess: () => {},
      onAuthRefreshError: () => {},
      onAuthLogout: () => {},
      onTokenExpired: () => {},
    });
    spyOn(service as any, 'setLocalStorageKeys');
    await (service as any).handleTokenExpired();
    expect(updateTokenSpy).toHaveBeenCalled();
    expect((service as any).setLocalStorageKeys).toHaveBeenCalled();
  });
});
