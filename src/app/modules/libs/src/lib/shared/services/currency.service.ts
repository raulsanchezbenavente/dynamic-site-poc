import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { EventBusService, IbeEventTypeEnum } from '../../core';
import { currencies } from '../../resources/currencies';
import { SessionSettingsResponse } from '../api-models';
import { EnumStorageKey } from '../enums';
import { CurrencyConfig } from '../model';

import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly currencySubject = new BehaviorSubject<string | null>(null);
  public currency$ = this.currencySubject.asObservable();

  private currencyConfig: CurrencyConfig | undefined;
  private currencySelectedByUser: boolean = false;

  constructor(
    protected readonly storageService: StorageService,
    protected readonly eventBusService: EventBusService
  ) {
    this.initializeCurrencyConfig();
    this.loadCurrency();
    this.subscribeToSessionSettingsResponse();
  }

  private initializeCurrencyConfig(): void {
    this.currencyConfig = {
      default: currencies.default,
      supported: currencies.supported,
    };
  }

  private loadCurrency(): void {
    const currency = this.getCurrencyByPriority();
    this.currencySelectedByUser = this.getCurrencyWasSelectedByUserFromStorage();
    if (currency) {
      this.currencySubject.next(currency);
    }
  }

  private getCurrencyByPriority(): string {
    const sessionCurrency = this.getCurrencyFromSessionStorage();
    if (sessionCurrency && this.isCurrencySupported(sessionCurrency)) {
      return sessionCurrency;
    }

    const storedCurrency = this.getCurrencyFromLocalStorage();
    if (storedCurrency && this.isCurrencySupported(storedCurrency)) {
      return storedCurrency;
    }

    const defaultCurrency = this.getDefaultCurrency();
    if (defaultCurrency && this.isCurrencySupported(defaultCurrency)) {
      return defaultCurrency;
    }

    return this.getFirstSupportedCurrency();
  }

  public setCurrency(selectedCurrency: string, isSelectedByUser: boolean): void {
    if (selectedCurrency && this.isCurrencySupported(selectedCurrency)) {
      this.setCurrencyToStorage(selectedCurrency);
      this.setCurrencyWasSelectedByUser(isSelectedByUser);
      this.currencySubject.next(selectedCurrency);
    }
  }

  private setCurrencyToStorage(selectedCurrency: string): void {
    this.storageService.setSessionStorage(EnumStorageKey.Currency, selectedCurrency);
    this.storageService.setLocalStorage(EnumStorageKey.Currency, selectedCurrency);
  }

  private getCurrencyFromLocalStorage(): string {
    return this.storageService.getLocalStorage(EnumStorageKey.Currency);
  }

  private getCurrencyFromSessionStorage(): string {
    return this.storageService.getSessionStorage(EnumStorageKey.Currency);
  }

  public getCurrentCurrency(): string {
    return this.currencySubject.value || '';
  }

  private getDefaultCurrency(): string {
    return this.currencyConfig?.default || this.currencyConfig?.supported?.[0] || '';
  }

  private getFirstSupportedCurrency(): string {
    return this.currencyConfig?.supported?.[0] || '';
  }

  private isCurrencySupported(currency: string): boolean {
    return this.currencyConfig?.supported?.includes(currency) || false;
  }

  private subscribeToSessionSettingsResponse(): void {
    this.eventBusService.eventNotifier$
      .pipe(filter((x) => x?.type === IbeEventTypeEnum.sessionSettingsResponse))
      .subscribe({
        next: (event) => {
          this.handleSessionSettingsResponse(event.payload);
        },
      });
  }

  private handleSessionSettingsResponse(res: SessionSettingsResponse): void {
    const sessionCurrency = res?.response?.currency?.value;
    if (sessionCurrency && this.isCurrencySupported(sessionCurrency) && !this.currencySelectedByUser) {
      this.setCurrency(sessionCurrency, false);
    }
  }

  private setCurrencyWasSelectedByUser(isSelectedByUser: boolean): void {
    this.storageService.setSessionStorage(EnumStorageKey.CurrencyWasSelectedByUser, isSelectedByUser);
    this.storageService.setLocalStorage(EnumStorageKey.CurrencyWasSelectedByUser, isSelectedByUser);
    this.currencySelectedByUser = isSelectedByUser;
  }

  private getCurrencyWasSelectedByUserFromStorage(): boolean {
    const sessionFlag = this.storageService.getSessionStorage(EnumStorageKey.CurrencyWasSelectedByUser);
    if (sessionFlag !== null) {
      return sessionFlag;
    }

    return this.storageService.getLocalStorage(EnumStorageKey.CurrencyWasSelectedByUser);
  }
}
