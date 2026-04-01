import { Injectable } from '@angular/core';

import { AccountType, EnumStorageKey } from '../enums';
import { AuthenticationTokenData } from '../model';

import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationStorageService {
  constructor(protected storageService: StorageService) {}

  /**
   * Save info about Authentication token
   * @param data New authentication token data to set in session storage
   */
  public setAuthenticationTokenData(data: AuthenticationTokenData): void {
    this.storageService.setSessionStorage(EnumStorageKey.AuthenticationTokenData, data);
  }

  /**
   * Get authentication data from storage. Enforce Date properties as dates are retrieved as strings from storage
   */
  public getAuthenticationTokenData(): AuthenticationTokenData {
    const data: AuthenticationTokenData = this.storageService.getLocalStorage(EnumStorageKey.AuthenticationTokenData);
    if (data) {
      return {
        accountInfo: data.accountInfo,
        createdAt: new Date(data.createdAt),
        refreshedAt: new Date(data.refreshedAt),
        refreshedTimes: data.refreshedTimes,
        token: data.token,
        accountSettingsDto: data.accountSettingsDto,
      };
    } else {
      return undefined!;
    }
  }

  /**
   * Clean Authentication token data from session storage
   */
  public removeAuthenticationTokenData(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.AuthenticationTokenData);
  }

  /**
   * Returns the AccountType of the logged-in user, or Anonymous
   */
  public getAccountType(): AccountType {
    const tokenData = this.getAuthenticationTokenData();
    return !!tokenData && tokenData.accountInfo ? tokenData.accountInfo.type : AccountType.ANONYMOUS;
  }
}
