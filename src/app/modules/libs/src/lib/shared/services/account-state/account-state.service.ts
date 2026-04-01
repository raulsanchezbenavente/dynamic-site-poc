import { effect, inject, Injectable, Injector, runInInjectionContext, signal, WritableSignal } from '@angular/core';
import { CustomerAccount } from '@dcx/ui/business-common';

import { EnumStorageKey } from '../../enums/enum-storage-keys';
import { StorageService } from '../storage.service';

/**
 * Simple global service to share account data between components
 * Data persists in sessionStorage to survive page navigation
 */
@Injectable({
  providedIn: 'root',
})
export class AccountStateService {
  private readonly storageService = inject(StorageService);
  private readonly injector = inject(Injector);

  /**
   * Private writable signal for account data
   */
  private readonly _accountDto: WritableSignal<CustomerAccount | null> = signal(null);
  /**
   * Public readonly signal for account data
   */
  public readonly accountDto = this._accountDto.asReadonly();

  /**
   * Callback function to be invoked when account data changes
   */
  private accountChangeCallback: ((account: CustomerAccount) => void) | null = null;

  constructor() {
    if (!this._accountDto()) {
      this.loadFromStorage();
    }
  }

  /**
   * Load account data from sessionStorage if available
   */
  private loadFromStorage(): void {
    const storedAccount = this.storageService.getSessionStorage(EnumStorageKey.AccountStateData);
    if (storedAccount) {
      this._accountDto.set(storedAccount);
    }
  }

  /**
   * Save account data to sessionStorage
   */
  private saveAccountDataToStorage(accountData: CustomerAccount | null): void {
    if (accountData) {
      this.storageService.setSessionStorage(EnumStorageKey.AccountStateData, accountData);
    }
  }

  /**
   * Set account data (used by loyalty component when it loads data)
   * @param accountData The account data to set
   */
  public setAccountData(accountData: CustomerAccount | null): void {
    this._accountDto.set(accountData);
    this.saveAccountDataToStorage(accountData);
  }

  /**
   * Get account data synchronously (used by find-bookings component)
   * @returns Current account data or null
   */
  public getAccountData(): CustomerAccount | null {
    return this._accountDto();
  }

  /**
   * Register a callback to be invoked when account data changes (non-null values only)
   * @param callback Function to call when account data changes
   */
  public onAccountChange(callback: (account: CustomerAccount) => void): void {
    this.accountChangeCallback = callback;

    runInInjectionContext(this.injector, () => {
      effect(() => {
        const accountData = this._accountDto();
        if (accountData && this.accountChangeCallback) {
          this.accountChangeCallback(accountData);
        }
      });
    });
  }
}
