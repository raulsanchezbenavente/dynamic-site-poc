import { inject, Injectable } from '@angular/core';
import {
  CultureServiceEx,
  EnumStorageKey,
  LoggerService,
  PointOfSaleService,
  PointOfSaleStored,
  StorageService,
} from '@dcx/ui/libs';

@Injectable({
  providedIn: 'root',
})
export class StorageSyncService {
  private readonly storageService = inject(StorageService);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly pointOfSaleService = inject(PointOfSaleService);
  private readonly logger = inject(LoggerService);

  /**
   * Synchronizes all from storage.
   */
  public syncFromStorage(): void {
    try {
      this.logger.info('StorageSyncService', 'Starting storage sync');

      this.syncCultureAndLanguage();
      this.syncPointOfSale();

      this.logger.info('StorageSyncService', 'Storage sync completed');
    } catch (error) {
      this.logger.error('StorageSyncService', 'Error during storage synchronization', error);
    }
  }

  public syncCultureAndLanguage(): void {
    try {
      const currentCulture = this.cultureServiceEx.getCulture();
      const storageLang = this.storageService.getSessionStorage(EnumStorageKey.Language);

      if (currentCulture && this.isCultureSupported(currentCulture)) {
        const normalizedUrlCulture = this.normalizeCultureCode(currentCulture);
        const normalizedStorageLang = this.normalizeCultureCode(storageLang || '');

        if (normalizedStorageLang !== normalizedUrlCulture) {
          this.logger.info(
            'StorageSyncService',
            `URL culture differs from storage. Updating storage: ${normalizedStorageLang} -> ${normalizedUrlCulture}`
          );
          this.storageService.setSessionStorage(EnumStorageKey.Language, normalizedUrlCulture);
          this.cultureServiceEx.setCulture(normalizedUrlCulture);
          return;
        }
      }

      if (!storageLang) {
        this.logger.info('StorageSyncService', 'No lang found to sync');
        return;
      }

      const normalized = this.normalizeCultureCode(storageLang);
      if (!normalized || !this.isCultureSupported(normalized)) {
        this.logger.warn('StorageSyncService', `Culture not supported: ${storageLang}`);
        return;
      }

      if (currentCulture === normalized) {
        this.logger.info('StorageSyncService', `Culture already set to: ${storageLang}`);
        return;
      }
    } catch (error) {
      this.logger.error('StorageSyncService', 'Error during culture and language synchronization', error);
    }
  }

  public syncPointOfSale(): void {
    try {
      const posSelection: PointOfSaleStored = this.storageService.getSessionStorage(EnumStorageKey.PointOfSale);
      if (!posSelection) {
        this.logger.warn('PointOfSaleSyncService', `Point of sale not found in session storage`);
        return;
      }
      const pointOfSale = this.pointOfSaleService.findPointOfSaleByCode(posSelection.posCode);
      if (!pointOfSale) {
        this.logger.warn('PointOfSaleSyncService', `Point of sale not found for code: ${posSelection.posCode}`);
        return;
      }

      this.logger.info('PointOfSaleSyncService', `Syncing point of sale from storage: ${posSelection.posCode}`);
      this.pointOfSaleService.changePointOfSale(pointOfSale, posSelection.userInteractWithPOSSelectorFlag);
    } catch (error) {
      this.logger.error('PointOfSaleSyncService', 'Error syncing point of sale from storage', error);
    }
  }

  /**
   * Redirects to the selected language URL using alternate links
   */
  private redirectToLanguage(language: string): void {
    const lang = language.toLowerCase();
    if (!lang) return;

    const link: HTMLLinkElement | null = document.querySelector(
      `link[rel="alternate"][hreflang^="${lang}-" i],link[rel="alternate"][hreflang="${lang}" i]`
    );

    if (link?.href) {
      const url = link.href + document.location.search;
      this.logger.info('LanguageSyncService', `Redirecting to language URL: ${url}`);
      globalThis.location.href = url;
    } else {
      this.logger.warn('LanguageSyncService', `No alternate URL found for language: ${lang}`);
    }
  }

  /**
   * Normalizes culture code to match supported formats
   * Extracts language code and returns it if supported
   */
  private normalizeCultureCode(code: string): string {
    if (!code) return '';

    const cleanCode = code.trim();

    if (/^[a-z]{2}-[A-Z]{2}$/i.test(cleanCode)) {
      const langCode = cleanCode.split('-')[0].toLowerCase();
      return langCode;
    }

    if (/^[a-z]{2}$/i.test(cleanCode)) {
      return cleanCode.toLowerCase();
    }

    return cleanCode;
  }

  /**
   * Checks if a culture is supported
   */
  private isCultureSupported(culture: string): boolean {
    const supportedCultures = this.cultureServiceEx.getSupportedCultures();
    return supportedCultures.includes(culture);
  }
}
