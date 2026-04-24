import { AuthService } from './auth.service';
import { AuthenticationStorageService } from '../authentication-storage.service';
import { KeycloakAuthService } from '../keycloak/keycloak.service';
import { AuthenticationTokenData } from '../../model';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let authStorageSpy: jasmine.SpyObj<AuthenticationStorageService>;
  let keycloakSpy: jasmine.SpyObj<KeycloakAuthService>;

  beforeEach(() => {
    authStorageSpy = jasmine.createSpyObj('AuthenticationStorageService', [
      'getAuthenticationTokenData',
      'setAuthenticationTokenData',
      'removeAuthenticationTokenData',
    ]);
    keycloakSpy = jasmine.createSpyObj('KeycloakAuthService', [
      'login',
      'logout',
    ], {
      isAuthenticated$: of(true),
      forceLogout$: of(false),
    });
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthenticationStorageService, useValue: authStorageSpy },
        { provide: KeycloakAuthService, useValue: keycloakSpy },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check isAuthenticated true', () => {
    authStorageSpy.getAuthenticationTokenData.and.returnValue({
      token: 'abc',
      accountInfo: {},
      createdAt: new Date(),
      refreshedAt: new Date(),
      refreshedTimes: 1,
      accountSettingsDto: {},
    } as AuthenticationTokenData);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should check isAuthenticated false if no token', () => {
    authStorageSpy.getAuthenticationTokenData.and.returnValue({
      token: '',
      accountInfo: {},
      createdAt: new Date(),
      refreshedAt: new Date(),
      refreshedTimes: 1,
      accountSettingsDto: {},
    } as AuthenticationTokenData);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should check isAuthenticated false if no data', () => {
    authStorageSpy.getAuthenticationTokenData.and.returnValue(undefined as any);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should save authentication token data', () => {
    const data = {
      token: 'abc',
      accountInfo: {},
      createdAt: new Date(),
      refreshedAt: new Date(),
      refreshedTimes: 1,
      accountSettingsDto: {},
    } as AuthenticationTokenData;
    service.saveAuthenticationTokenData(data);
    expect(authStorageSpy.setAuthenticationTokenData).toHaveBeenCalledWith(data);
  });

  it('should call login on keycloakService', () => {
    service.login('redirect');
    expect(keycloakSpy.login).toHaveBeenCalledWith('redirect');
  });

  it('should remove authentication token data', () => {
    service.removeAuthenticationTokenData();
    expect(authStorageSpy.removeAuthenticationTokenData).toHaveBeenCalled();
  });

  it('should call logout on keycloakService and remove token', () => {
    service.logout('redirect');
    expect(authStorageSpy.removeAuthenticationTokenData).toHaveBeenCalled();
    expect(keycloakSpy.logout).toHaveBeenCalledWith('redirect');
  });

  it('should return isAuthenticatedKeycloak$ observable', (done) => {
    service.isAuthenticatedKeycloak$().subscribe((val) => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should return forceLogout$ observable', (done) => {
    service.forceLogout$().subscribe((val) => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('should get authentication token data', () => {
    const expected = {
      token: 'abc',
      accountInfo: {},
      createdAt: new Date(),
      refreshedAt: new Date(),
      refreshedTimes: 1,
      accountSettingsDto: {},
    } as AuthenticationTokenData;
    authStorageSpy.getAuthenticationTokenData.and.returnValue(expected);
    expect(service.getAuthenticationTokenData()).toEqual(expected);
  });
});
