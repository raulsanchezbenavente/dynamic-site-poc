import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CommonConfig,
  ConfigService,
  CookieService,
  EnumStorageKey,
  KEYCLOAK_CONSTANTS,
  KeycloakConfiguration,
  KeycloakKeys,
  StorageService,
} from '@dcx/ui/libs';
import { KeycloakEvent, KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { KeycloakFlow, KeycloakOnLoad, KeycloakPkceMethod, KeycloakResponseMode } from 'keycloak-js';
import { BehaviorSubject, filter, firstValueFrom, Observable } from 'rxjs';

import { EventHandler, KeycloakAuthEvent, LoginStatusData } from '../../model/keycloak/keycloak-auth.model';
import { AuthMultitabCoordinatorService } from '../auth/auth-multitab-coordinator.service';
import { AuthenticationStorageService } from '../authentication-storage.service';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject
    .asObservable()
    .pipe(filter((value) => value !== null));
  private readonly forceLogoutSubject = new BehaviorSubject<boolean>(false);
  public readonly forceLogout$ = this.forceLogoutSubject.asObservable();
  private readonly expiredSessionSubject = new BehaviorSubject<boolean>(false);
  public readonly expiredSession$ = this.expiredSessionSubject.asObservable();
  private readonly keycloakConfigSubject = new BehaviorSubject<KeycloakConfiguration | null>(null);
  public readonly keycloakConfig$ = this.keycloakConfigSubject.asObservable();
  private keycloakConfig!: KeycloakConfiguration;
  private isLogoutInProgress: boolean = false;
  private readonly isVisibleTab = signal<boolean>(false);
  private logoutAutomaticallyExecuted: boolean = false;

  private readonly eventHandlers = new Map<KeycloakEventType, EventHandler>([
    [KeycloakEventType.OnAuthLogout, this.handleAuthLogout.bind(this)],
    [KeycloakEventType.OnAuthRefreshError, this.handleAuthLogout.bind(this)],
    [KeycloakEventType.OnAuthError, this.handleAuthLogout.bind(this)],
  ]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly keycloakService = inject(KeycloakService);
  private readonly authenticationStorageService = inject(AuthenticationStorageService);
  private readonly configService = inject(ConfigService);
  private readonly storageService = inject(StorageService);
  private readonly authMultitabCoordinator = inject(AuthMultitabCoordinatorService);
  private readonly cookieService = inject(CookieService);
  private readonly API_SESSION_ID: string = 'ApiSessionId-';

  constructor() {
    this.initializeService();
  }

  public async initialize(): Promise<void> {
    try {
      this.keycloakConfig = await firstValueFrom(
        this.configService.getCommonConfig<KeycloakConfiguration>(CommonConfig.KEYCLOAK_CONFIGURATION)
      );

      if (!this.keycloakConfig) {
        throw new Error('Keycloak configuration is required');
      }

      this.keycloakConfigSubject.next(this.keycloakConfig);
      this.subscribeToKeycloakEvents();
      const refreshToken = localStorage.getItem(KeycloakKeys.KC_REFRESH_TOKEN);
      const token = localStorage.getItem(KeycloakKeys.KC_TOKEN);
      if (localStorage.getItem(KEYCLOAK_CONSTANTS.NEEDS_IDP_LOGOUT) === KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE) {
        this.logout(globalThis.location.origin + globalThis.location.pathname);
        return;
      }
      const authenticated = await this.keycloakService.init({
        config: {
          url: this.keycloakConfig.url,
          realm: this.keycloakConfig.realm,
          clientId: this.keycloakConfig.clientId,
        },
        initOptions: {
          // Determines how Keycloak should behave on application load:
          // 'check-sso' checks for an existing login silently
          // 'login-required' forces a login if the user is not authenticated
          onLoad: KEYCLOAK_CONSTANTS.DEFAULT_INIT_OPTIONS.onLoad as KeycloakOnLoad,

          refreshToken: refreshToken ?? undefined,

          token: token ?? undefined,

          // Enables periodic checking via a hidden iframe to detect session changes
          checkLoginIframe: false,

          // How the authentication response is returned:
          // 'fragment' uses the URL hash to return tokens (commonly used in SPAs)
          responseMode: KEYCLOAK_CONSTANTS.DEFAULT_INIT_OPTIONS.responseMode as KeycloakResponseMode,

          // Enables verbose logging for debugging purposes
          enableLogging: this.keycloakConfig.enableLogging ?? false,

          // Sets the PKCE (Proof Key for Code Exchange) method
          // 'S256' is more secure and widely recommended
          pkceMethod: KEYCLOAK_CONSTANTS.DEFAULT_INIT_OPTIONS.pkceMethod as KeycloakPkceMethod,

          // The URI to use for silent SSO checks (should be listed in Keycloak client settings)
          silentCheckSsoRedirectUri: `${location.protocol}//${location.host}${this.keycloakConfig.silentCheckSsoRedirectUri}`,

          // Enables fallback if silent SSO check fails (may reload the page)
          silentCheckSsoFallback: false,

          // The OAuth2 flow type to use:
          // 'standard' uses Authorization Code Flow with PKCE (secure and recommended)
          flow: KEYCLOAK_CONSTANTS.DEFAULT_INIT_OPTIONS.flow as KeycloakFlow,
        },
      });

      if (!authenticated) {
        this.handleUnauthenticated();
      }
      return;
    } catch {
      this.isAuthenticatedSubject.next(false);
      return;
    }
  }

  public async login(redirectUri?: string): Promise<void> {
    if (redirectUri) {
      await this.keycloakService.login({
        redirectUri,
      });
    } else {
      await this.keycloakService.login();
    }
  }

  public logout(redirectUri: string): void {
    this.deleteCookiesAndKeysBeforeRedirect();
    this.storageService.setLocalStorage(KeycloakKeys.LOGOUT_PROCESS, KeycloakKeys.LOGOUT_PROCESS);

    const logoutUrl = this.buildLogoutUrl(redirectUri);
    globalThis.location.href = logoutUrl;
  }

  private buildLogoutUrl(redirectUri: string): string {
    const baseUrl = `${this.keycloakConfig.url}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/logout`;
    const params = new URLSearchParams();
    const idToken = this.keycloakInstance?.idToken ?? localStorage.getItem(KeycloakKeys.KC_ID_TOKEN);
    if (idToken) {
      params.append('id_token_hint', idToken);
    }

    params.append('post_logout_redirect_uri', redirectUri);

    return `${baseUrl}?${params.toString()}`;
  }

  private deleteCookiesAndKeysBeforeRedirect(): void {
    this.deleteAllApiSessionCookies();
    this.removeKySessionCookie();
    this.storageService.removeLocalStorage(EnumStorageKey.AuthenticationTokenData);
    this.storageService.removeSessionStorage(KEYCLOAK_CONSTANTS.TAB_SESSION_ID);
  }

  private subscribeToKeycloakEvents(): void {
    this.keycloakService.keycloakEvents$.subscribe({
      next: (event: KeycloakEvent) => {
        if (event.type == KeycloakEventType.OnTokenExpired) {
          this.handleOnTokenExpired();
        } else if (event.type == KeycloakEventType.OnAuthRefreshError) {
          this.handleOnAuthLogout();
        } else if (event.type == KeycloakEventType.OnAuthSuccess) {
          this.handleOnAuthSuccess();
        } else if (event.type == KeycloakEventType.OnAuthError) {
          this.handleUnauthenticated();
        } else if (event.type == KeycloakEventType.OnAuthLogout) {
          this.handleOnAuthLogout();
        }
      },
    });
  }

  public getTokenSync(): string | null {
    try {
      return this.keycloakService.getKeycloakInstance()?.token ?? null;
    } catch {
      return null;
    }
  }

  private setLocalStorageKeys(): void {
    this.setLocalStorageItem(KeycloakKeys.KC_TOKEN, this.getTokenSync() ?? '');
    this.setLocalStorageItem(KeycloakKeys.KC_REFRESH_TOKEN, this.getRefreshTokenSync() ?? '');
    const idToken = this.keycloakInstance?.idToken;
    if (idToken) {
      this.setLocalStorageItem(KeycloakKeys.KC_ID_TOKEN, idToken);
    } else {
      this.setLocalStorageItem(KeycloakKeys.KC_ID_TOKEN, 'notInstanced');
    }
  }

  private removeLocalStorageKeysToken(): void {
    this.removeLocalStorageKeys([KeycloakKeys.KC_TOKEN, KeycloakKeys.KC_REFRESH_TOKEN]);
  }

  private setLocalStorageItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private get keycloakInstance(): ReturnType<KeycloakService['getKeycloakInstance']> {
    return this.keycloakService.getKeycloakInstance();
  }

  private handleOnAuthSuccess(): void {
    this.resetLogoutState();
    this.setLocalStorageKeys();
    this.storageService.setSessionStorage(KEYCLOAK_CONSTANTS.LOGIN_STATUS_KEY, {
      isLoggedIn: true,
    } as LoginStatusData);
    this.isAuthenticatedSubject.next(true);
  }

  private handleOnTokenExpired(): void {
    this.handleTokenExpired();
  }

  private handleUnauthenticated(): void {
    this.removeLocalStorageKeysToken();
    this.isAuthenticatedSubject.next(false);
    this.authenticationStorageService.removeAuthenticationTokenData();
  }

  private async handleTokenExpired(): Promise<void> {
    const keycloakInstance = this.keycloakService.getKeycloakInstance();
    if (!keycloakInstance) return;
    try {
      await keycloakInstance.updateToken(KEYCLOAK_CONSTANTS.TOKEN_REFRESH_THRESHOLD);
      const { refreshToken, token } = keycloakInstance;

      if (refreshToken && token) {
        this.setLocalStorageKeys();
      }
    } catch {
      // Send logout event to other tabs but mark this as session expiration
      this.authMultitabCoordinator.sendKeycloakEvent(KeycloakEventType.OnAuthLogout, false, true, true);
    }
  }

  private getRefreshTokenSync(): string | null {
    try {
      return this.keycloakService.getKeycloakInstance()?.refreshToken ?? null;
    } catch {
      return null;
    }
  }

  private handleExpiredSession(): void {
    this.expiredSessionSubject.next(true);
  }

  private initializeService(): void {
    this.setupMultitabEventListener();
    this.setupVisibilityChangeListener();
  }

  private setupMultitabEventListener(): void {
    this.authMultitabCoordinator.keycloakEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: KeycloakAuthEvent | null) => event && this.handleMultitabKeycloakEvent(event));
    this.processSharedLogoutFlag();
  }

  private processSharedLogoutFlag(): void {
    if (this.storageService.getLocalStorage(KeycloakKeys.LOGOUT_PROCESS)) {
      this.storageService.removeLocalStorage(KeycloakKeys.LOGOUT_PROCESS);
      this.clearAuthenticationData();
      this.authMultitabCoordinator.sendKeycloakEvent(KeycloakEventType.OnAuthLogout, false, false);
    }
  }

  private clearAuthenticationData(): void {
    this.storageService.setSessionStorage(KEYCLOAK_CONSTANTS.LOGIN_STATUS_KEY, {
      isLoggedIn: false,
    } as LoginStatusData);

    this.deleteAllApiSessionCookies();

    this.removeSessionStorageKeys([
      KeycloakKeys.AUTHENTICATED_EMITTED,
      KeycloakKeys.AUTHENTICATED_FINALIZED,
      EnumStorageKey.AuthenticationTokenData,
      EnumStorageKey.AccountStateData,
      KEYCLOAK_CONSTANTS.ACCOUNT_DATA_KEY,
      KEYCLOAK_CONSTANTS.TAB_SESSION_ID,
    ]);

    this.removeLocalStorageKeys([
      KeycloakKeys.KEYCLOAK_LOGIN_EXIT_BY_OTHER_TAB,
      KEYCLOAK_CONSTANTS.ACCOUNT_DATA_KEY,
      EnumStorageKey.AuthenticationTokenData,
      KEYCLOAK_CONSTANTS.EVENT_NOTIFICATION,
      KEYCLOAK_CONSTANTS.RETRY_LOGOUT,
      KEYCLOAK_CONSTANTS.NEEDS_IDP_LOGOUT,
      KeycloakKeys.KC_ID_TOKEN,
    ]);

    this.removeKySessionCookie();
    this.removeLocalStorageKeysToken();
  }

  private removeKySessionCookie(): void {
    this.deleteCookieByBruteForceDomain(KeycloakKeys.KY_SESSION);
  }

  private deleteAllApiSessionCookies(): void {
    this.deleteApiKeyCookie(KEYCLOAK_CONSTANTS.TAB_SESSION_ID);
  }

  private deleteApiKeyCookie(keys: string): void {
    const objectKeys = this.storageService.getSessionStorage(keys);
    if (objectKeys) {
      const apiKey = objectKeys.tabSessionId;
      if (apiKey) {
        this.deleteCookieByBruteForceDomain(this.API_SESSION_ID + apiKey);
      }
    }
  }

  private removeSessionStorageKeys(keys: string[]): void {
    for (const key of keys) {
      this.storageService.removeSessionStorage(key);
    }
  }

  private getCookieDomainCandidates(hostname: string = location.hostname): string[] {
    const host = hostname.replace(/:\d+$/, '').toLowerCase();
    if (host === 'localhost' || host === '[::1]' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return ['', host];
    }
    const parts = host.split('.').filter(Boolean);
    const out = new Set<string>();
    out.add('');
    for (let i = 0; i < parts.length; i++) {
      const d = parts.slice(i).join('.');
      out.add(d);
      out.add('.' + d);
    }
    return Array.from(out).sort((a, b) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return b.split('.').length - a.split('.').length;
    });
  }

  private deleteCookieByBruteForceDomain(key: string): void {
    const candidateDomains = this.getCookieDomainCandidates();
    for (const domain of candidateDomains) {
      this.cookieService.delete(key, { domain });
    }
  }

  private removeLocalStorageKeys(keys: string[]): void {
    for (const key of keys) {
      this.storageService.removeLocalStorage(key);
    }
  }

  private handleMultitabKeycloakEvent(event: KeycloakAuthEvent): void {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  /**
   * Handles the logout event for the Keycloak authentication.
   * @param event The KeycloakAuthEvent containing event details.
   * @returns void
   */
  private handleAuthLogout(event: KeycloakAuthEvent): void {
    // Set logout request when automatic communication
    const keycloakInstance = this.keycloakService.getKeycloakInstance();
    if (event.preLogout) {
      this.logoutAutomatically();
      return;
    }

    if (keycloakInstance) keycloakInstance.clearToken();

    const loginStatus: LoginStatusData = this.storageService.getSessionStorage(KEYCLOAK_CONSTANTS.LOGIN_STATUS_KEY);

    if (!loginStatus?.isLoggedIn) {
      return;
    }

    this.clearAuthenticationData();
    this.resetLogoutState();
    if (!event.isActionTab) {
      if (this.isVisibleTab()) {
        this.handleExpiredSession();
      } else {
        globalThis.location.reload();
      }
    }
  }

  private logoutAutomatically(): void {
    if (this.logoutAutomaticallyExecuted) {
      return;
    }

    const retry = localStorage.getItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT);

    if (retry === null) {
      this.handleFirstLogoutAttempt();
      return;
    }

    if (retry === KEYCLOAK_CONSTANTS.STORAGE_FLAG_EXHAUSTED) {
      this.logoutAutomaticallyExecuted = true;
      return;
    }

    if (retry === KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE && this.expiredSessionSubject.getValue()) {
      return;
    }

    if (retry === KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE) {
      localStorage.setItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT, KEYCLOAK_CONSTANTS.STORAGE_FLAG_EXHAUSTED);
      this.logoutAutomaticallyExecuted = true;
    }

    this.forceLogoutSubject.next(true);
  }

  private handleFirstLogoutAttempt(): void {
    if (!this.isVisibleTab()) {
      this.forceLogoutSubject.next(true);
      return;
    }
    localStorage.setItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT, KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE);
    this.logoutAutomaticallyExecuted = true;
    this.removeKySessionCookie();
    this.handleExpiredSession();
  }

  private handleOnAuthLogout(): void {
    if (this.getKySessionCookie()) return;

    this.authMultitabCoordinator.sendKeycloakEvent(KeycloakEventType.OnAuthLogout, false, true, true);
  }

  private getKySessionCookie(): boolean {
    try {
      const cookieValue = this.cookieService.get(KeycloakKeys.KY_SESSION);
      return cookieValue != null && cookieValue !== undefined;
    } catch {
      return false;
    }
  }

  private setupVisibilityChangeListener(): void {
    const visibilityHandler = (): void => this.handleVisibilityChange();
    const VISIBILITY_EVENTS = ['pageshow', 'pagehide'] as const;
    for (const evt of VISIBILITY_EVENTS) {
      globalThis.removeEventListener(evt, visibilityHandler);
      globalThis.addEventListener(evt, visibilityHandler);
    }

    document.removeEventListener('visibilitychange', visibilityHandler);
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  private handleVisibilityChange(): void {
    this.isVisibleTab.set(!document.hidden);
    if (document.hidden) {
      return;
    }

    const keycloak = this.keycloakService.getKeycloakInstance();
    if (this.shouldRetryLogout()) {
      this.processRetryLogout();
      return;
    }
    if (this.isUserAuthenticatedWithValidSession(keycloak) && this.isCookieExpired()) {
      this.handleCookieExpiration();
    }
  }

  private isCookieExpired(): boolean {
    return !this.getKySessionCookie();
  }

  private processRetryLogout(): void {
    this.storageService.removeLocalStorage(KEYCLOAK_CONSTANTS.EVENT_NOTIFICATION);

    this.resetLogoutState();
    this.handleCookieExpiration();
  }

  private handleCookieExpiration(): void {
    if (this.isLogoutInProgress) {
      return;
    }
    this.startLogoutProcess();
    this.logoutWithPopup();
  }

  private logoutWithPopup(): void {
    this.authMultitabCoordinator.sendKeycloakEvent(KeycloakEventType.OnAuthLogout, false, true, true);
  }

  private startLogoutProcess(): void {
    this.isLogoutInProgress = true;
  }

  private resetLogoutState(): void {
    this.isLogoutInProgress = false;
  }

  private isUserAuthenticatedWithValidSession(keycloak: any): boolean {
    return keycloak?.authenticated;
  }

  private shouldRetryLogout(): boolean {
    const retryLogoutFlag = localStorage.getItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT);
    return retryLogoutFlag === KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE;
  }
}
