import { inject, Injectable } from '@angular/core';
import { KeycloakConfiguration } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AuthenticationTokenData } from '../../model';
import { AuthenticationStorageService } from '../authentication-storage.service';
import { KeycloakAuthService } from '../keycloak/keycloak.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStorageService = inject(AuthenticationStorageService);
  private readonly keycloakService = inject(KeycloakAuthService);

  public isAuthenticated(): boolean {
    const tokenData = this.authStorageService.getAuthenticationTokenData();
    return !!tokenData && !!tokenData.token;
  }

  public saveAuthenticationTokenData(data: AuthenticationTokenData): void {
    this.authStorageService.setAuthenticationTokenData(data);
  }

  public login(redirectUri?: string): void {
    this.keycloakService.login(redirectUri);
  }

  public removeAuthenticationTokenData(): void {
    this.authStorageService.removeAuthenticationTokenData();
  }

  public logout(redirectUri: string): void {
    this.removeAuthenticationTokenData();
    this.keycloakService.logout(redirectUri);
  }

  public isAuthenticatedKeycloak$(): Observable<boolean> {
    return this.keycloakService.isAuthenticated$;
  }

  public forceLogout$(): Observable<boolean> {
    return this.keycloakService.forceLogout$;
  }

  public expiredSession$(): Observable<boolean> {
    return this.keycloakService.expiredSession$;
  }

  public keycloakConfig$(): Observable<KeycloakConfiguration | null> {
    return this.keycloakService.keycloakConfig$;
  }

  public getAuthenticationTokenData(): AuthenticationTokenData {
    const authenticationData = this.authStorageService.getAuthenticationTokenData();
    return authenticationData;
  }
}
