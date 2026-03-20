import { Injectable } from '@angular/core';
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

  public get isAuthenticated(): boolean {
    return Boolean(this.keycloak.authenticated);
  }

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
        pkceMethod: 'S256',
        checkLoginIframe: false,
        enableLogging: environment.keycloak.enableLogging,
      })
      .then(() => undefined);

    await this.initPromise;
  }

  public async login(): Promise<void> {
    await this.ensureInitialized();
    await this.keycloak.login();
  }

  public async logout(): Promise<void> {
    await this.ensureInitialized();
    const maxRetries = environment.keycloak.logoutRetryAttempts;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        await this.keycloak.logout({ redirectUri: globalThis.location.origin });
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
