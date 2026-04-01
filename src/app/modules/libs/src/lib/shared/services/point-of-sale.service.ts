import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  CurrencyService,
  PointOfSale,
  PointOfSaleStored,
  SessionSettingsResponse,
  SessionSettingsService,
  urlHelpers,
} from '../../shared';
import { EnumStorageKey } from '../enums/enum-storage-keys';
import { EnumUrlParameter } from '../enums/enum-url-parameters';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PointOfSaleService {
  private readonly pointsOfSaleAvailableSubject = new BehaviorSubject<boolean>(false);
  public readonly pointsOfSaleAvailable$ = this.pointsOfSaleAvailableSubject.asObservable();
  private readonly storageService = inject(StorageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly sessionSettingsService = inject(SessionSettingsService);
  private readonly pointOfSaleSubject = new BehaviorSubject<PointOfSale | null>(null);
  private readonly location = inject(Location);
  public readonly pointOfSale$ = this.pointOfSaleSubject.asObservable();
  public pointsOfSaleList: PointOfSale[] = [];

  public initializePointsOfSale(pointsOfSaleList: PointOfSale[]): void {
    this.pointsOfSaleList = pointsOfSaleList;
    this.loadPointOfSale();
    this.subscribeToSessionSettings();
  }

  private loadPointOfSale(): void {
    if (this.pointsOfSaleList.length === 0) {
      return;
    } else {
      this.pointsOfSaleAvailableSubject.next(true);
    }

    const codeFromUrl = this.getCodeFromUrl();
    if (codeFromUrl) {
      const pointOfSaleFromUrl = this.findByCodeOrCountryCode(codeFromUrl);
      if (pointOfSaleFromUrl) {
        const storedFlag = this.getStoredUserInteractionFlagForCode(pointOfSaleFromUrl.code);
        this.setPointOfSale(pointOfSaleFromUrl, storedFlag);
        return;
      }
    }

    const pointOfSaleFromSessionStorage = this.getPointOfSaleFromSessionStorage();
    if (pointOfSaleFromSessionStorage) {
      const foundInSessionFromList = this.findByCodeOrCountryCode(pointOfSaleFromSessionStorage.posCode);
      if (foundInSessionFromList) {
        this.setPointOfSale(foundInSessionFromList, pointOfSaleFromSessionStorage.userInteractWithPOSSelectorFlag);
        return;
      }
    }

    const defaultPointOfSale = this.getDefault();
    if (defaultPointOfSale) {
      this.setPointOfSale(defaultPointOfSale, false);
    }
  }

  public getCurrentPointOfSale(): PointOfSale | null {
    const currentValue = this.pointOfSaleSubject.value;
    if (currentValue) {
      return currentValue;
    }
    const storedPointOfSale = this.getPointOfSaleFromSessionStorage();
    return storedPointOfSale ? this.mapStoredToPointOfSale(storedPointOfSale) : null;
  }

  public changePointOfSale(selectedPointOfSale: PointOfSale, userInteractWithPOSSelectorFlag: boolean = true): void {
    this.updatePosCodeInUrl(selectedPointOfSale.code);
    this.setPointOfSale(selectedPointOfSale, userInteractWithPOSSelectorFlag);
  }

  /**
   * Finds a point of sale by its code or country code
   * Returns null if not found
   */
  public findPointOfSaleByCode(code: string): PointOfSale | null {
    return this.findByCodeOrCountryCode(code) ?? null;
  }

  private setPointOfSale(selectedPointOfSale: PointOfSale, userInteractWithPOSSelectorFlag: boolean = false): void {
    if (!selectedPointOfSale) return;

    this.setPointOfSaleToStorage(selectedPointOfSale, userInteractWithPOSSelectorFlag);
    this.currencyService.setCurrency(selectedPointOfSale.currency.code, userInteractWithPOSSelectorFlag);
    this.pointOfSaleSubject.next(selectedPointOfSale);
  }

  private setPointOfSaleToStorage(selectedPoint: PointOfSale, userInteractWithPOSSelectorFlag: boolean): void {
    if (!selectedPoint) return;

    this.setPointOfSaleToSessionStorage(selectedPoint, userInteractWithPOSSelectorFlag);
  }

  private getPointOfSaleFromSessionStorage(): PointOfSaleStored | null {
    return this.storageService.getSessionStorage(EnumStorageKey.PointOfSale);
  }

  private setPointOfSaleToSessionStorage(selectedPoint: PointOfSale, userInteractWithPOSSelectorFlag: boolean): void {
    if (!selectedPoint) return;
    const posData: PointOfSaleStored = {
      posCode: selectedPoint.code,
      name: selectedPoint.name,
      default: selectedPoint.default,
      stationCode: selectedPoint.stationCode,
      userInteractWithPOSSelectorFlag: userInteractWithPOSSelectorFlag,
      imgSrc: '',
      otherCountryCodes: selectedPoint.otherCountryCodes,
      currency: selectedPoint.currency,
    };
    this.storageService.setSessionStorage(EnumStorageKey.PointOfSale, posData);
  }

  private findByCodeOrCountryCode(code: string): PointOfSale | undefined {
    return this.pointsOfSaleList.find(
      (pos) =>
        (pos.countryCode ?? '').toLowerCase() === code.toLowerCase() ||
        pos.code.toLowerCase() === code.toLowerCase() ||
        (pos.otherCountryCodes ?? []).some((x) => x.toLowerCase() === code.toLowerCase())
    );
  }

  private getDefault(): PointOfSale | null {
    if (this.pointsOfSaleList.length === 0) {
      return null;
    }

    const defaultPointOfSale = this.pointsOfSaleList.find((pos) => pos.default);

    if (defaultPointOfSale) {
      return defaultPointOfSale;
    }

    return this.pointsOfSaleList[0];
  }

  private subscribeToSessionSettings(): void {
    this.sessionSettingsService.sessionSettingsData$.subscribe((data) => {
      if (!data) return;
      const shouldHandleResponse = this.shouldProcessSession(data);
      if (shouldHandleResponse && this.pointsOfSaleList.length > 0) {
        let selectedPointOfSale: PointOfSale | null = null;
        const countryCode = data.response?.countryCode;
        if (countryCode) {
          selectedPointOfSale = this.findByCodeOrCountryCode(countryCode) ?? this.getDefault();
        }
        const currentPointOfSale = this.getCurrentPointOfSale();
        if (selectedPointOfSale && !this.isSameSelection(currentPointOfSale, selectedPointOfSale)) {
          this.pointOfSaleSubject.next(selectedPointOfSale);
        }
      }
    });
  }

  private isSameSelection(currentPos: PointOfSale | null, newPos: PointOfSale): boolean {
    return !!currentPos && currentPos.code === newPos.code;
  }

  /**
   * Gets point of sale code from URL parameters
   */
  private getCodeFromUrl(): string {
    const currentPath = this.location.path();
    return (
      urlHelpers.getParameterByName(EnumUrlParameter.PosCode, currentPath) ||
      urlHelpers.getParameterByName(EnumUrlParameter.PosCode.toLowerCase(), currentPath) ||
      ''
    );
  }

  /**
   * Checks if user has interacted with POS selector (priority: session > local storage)
   */
  private hasUserInteractedWithPOSSelector(): boolean {
    const sessionPosData = this.getPointOfSaleFromSessionStorage();
    return sessionPosData?.userInteractWithPOSSelectorFlag ?? false;
  }

  /**
   * Gets user interaction flag for a specific point of sale code
   * Returns true if stored POS matches the code and user has interacted, false otherwise
   */
  private getStoredUserInteractionFlagForCode(posCode: string): boolean {
    const sessionPosData = this.getPointOfSaleFromSessionStorage();
    if (sessionPosData?.posCode === posCode) {
      return sessionPosData.userInteractWithPOSSelectorFlag;
    }

    return false;
  }

  /**
   * Checks if there's a code in the URL
   */
  private hasCodeInUrl(): boolean {
    const posCode = this.getCodeFromUrl();
    return posCode !== '';
  }

  /**
   * Updates the posCode parameter in the URL
   */
  public updatePosCodeInUrl(posCode: string): void {
    urlHelpers.updateUrlParameter(EnumUrlParameter.PosCode, posCode);
    urlHelpers.updateUrlParameter(EnumUrlParameter.PosCode.toLowerCase(), posCode);
  }

  /**
   * Determines if session settings should be processed
   */
  private shouldProcessSession(response: SessionSettingsResponse): boolean {
    let shouldHandleResponse = true;
    if (!response || this.hasCodeInUrl() || this.hasUserInteractedWithPOSSelector()) {
      shouldHandleResponse = false;
    }
    return shouldHandleResponse;
  }

  /**
   * Maps PointOfSaleStored to PointOfSale interface
   */
  private mapStoredToPointOfSale(stored: PointOfSaleStored): PointOfSale {
    return {
      name: stored.name || '',
      stationCode: stored.stationCode,
      code: stored.code || '',
      default: stored.default || false,
      flagImageCode: stored.flagImageCode || '',
      currency: stored.currency || { symbol: '', code: '', name: '' },
      countryCode: undefined, // Not available in stored data
      otherCountryCodes: stored.otherCountryCodes,
      isForRestOfCountries: false, // Default value as not available in stored data
    };
  }
}
