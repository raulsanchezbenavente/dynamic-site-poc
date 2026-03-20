import { Injectable, computed, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private readonly keycloak = new Keycloak({
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });
  private initPromise: Promise<void> | null = null;
  private readonly authStateChange = signal(0); // Trigger para forzar recalc

  public readonly isAuthenticated = computed(() => {
    this.authStateChange(); // Dependencia para reactividad
    return Boolean(this.keycloak.authenticated);
  });

  public get token(): string | undefined {
    return this.keycloak.token;
  }

  public async init(): Promise<void> {
    await this.ensureInitialized();
  }

  public async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    if (!globalThis.isSecureContext) {
      throw new Error('Keycloak requires HTTPS (or localhost) because PKCE needs Web Crypto API.');
    }

    this.initPromise = this.keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${globalThis.location.origin}/silent-check-sso.html`,
        silentCheckSsoFallback: true,
        pkceMethod: 'S256',
        checkLoginIframe: false,
        enableLogging: environment.keycloak.enableLogging,
      })
      .then(() => {
        // Esperar suficiente tiempo para que Keycloak cargue tokens e initialice completamente
        return new Promise((resolve) => setTimeout(resolve, 300));
      })
      .then(() => {
        // Intentar actualizar el token para refrescarlo si está próximo a expirar
        return this.keycloak.updateToken(60).catch(() => undefined);
      })
      .then(() => {
        this.authStateChange.update((v) => v + 1); // Trigger computed update
      });

    await this.initPromise;
  }

  public async login(): Promise<void> {
    await this.ensureInitialized();
    await this.keycloak.login();
    this.authStateChange.update((v) => v + 1);
  }

  public async logout(): Promise<void> {
    await this.ensureInitialized();
    const maxRetries = environment.keycloak.logoutRetryAttempts;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        await this.keycloak.logout({ redirectUri: globalThis.location.origin });
        this.authStateChange.update((v) => v + 1);
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  public async getValidToken(minValiditySeconds = 20): Promise<string | undefined> {
    await this.ensureInitialized();

    if (!this.keycloak.authenticated) {
      return undefined;
    }

    await this.keycloak.updateToken(minValiditySeconds);
    return this.keycloak.token;
  }
}
