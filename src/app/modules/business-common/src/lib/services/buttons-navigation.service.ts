import { computed, inject, Injectable, signal } from '@angular/core';
import { CULTURES, EnumStorageKey, LoggerService, StorageService } from '@dcx/ui/libs';

import { NavigationHistory } from './models/navigation-history.model';

@Injectable({
  providedIn: 'root',
})
export class ButtonsNavigationService {
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);

  private readonly navigationHistory = signal<NavigationHistory | null>(this.loadFromStorage());

  public readonly originUrl = computed(() => this.navigationHistory()?.originPage?.url ?? null);

  /**
   * Saves the navigation history
   * @param history - The navigation history object to store
   */
  public setNavigationHistory(history: NavigationHistory): void {
    this.storageService.setSessionStorage(EnumStorageKey.NavigationHistory, history);
    this.navigationHistory.set(history);
    this.logger.info('ButtonsNavigationService', 'Navigation history set', history);
  }

  /**
   * Gets the redirection URL to apply override
   * @param currentPath - The current path to validate against loops
   * @returns The origin URL if it should be applied, null otherwise
   */
  public getRedirectOverrideUrl(currentPath: string): string | null {
    const history = this.navigationHistory();

    if (!history?.originPage?.url) {
      return null;
    }

    const overrideUrl = history.originPage.url;

    // Validation needed to prevent redirection loops
    if (this.normalizeCultureInUrl(currentPath) === this.normalizeCultureInUrl(overrideUrl)) {
      this.logger.info('ButtonsNavigationService', 'Skipping redirect override - current page matches origin', {
        currentPath,
        overrideUrl,
      });
      return null;
    }

    return overrideUrl;
  }

  /**
   * Clears the navigation history from storage and state
   */
  public clearNavigationHistory(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.NavigationHistory);
    this.navigationHistory.set(null);
    this.logger.info('ButtonsNavigationService', 'Navigation history cleared');
  }

  /**
   * Normalizes a URL by removing the culture segment to allow culture-agnostic comparison
   * Converts paths like '/uiplus/es/check-in/home/' and '/uiplus/en/check-in/home/'
   * to the same normalized form '/uiplus/check-in/home/'
   * Removes any supported culture code found as a complete segment in the URL path
   * @param url - The URL to normalize
   * @returns The URL with culture segment removed
   */
  private normalizeCultureInUrl(url: string): string {
    // Build regex pattern from supported cultures: /(en|es|pt|fr)/
    const culturePattern = CULTURES.supported.join('|');
    // Match any supported culture as a complete segment: /culture/
    // Replaces with single / to remove the culture segment
    const regex = new RegExp(String.raw`\/(${culturePattern})\/`, 'i');
    const res = url.replace(regex, '/');
    return res;
  }

  /**
   * Loads the history from storage
   */
  private loadFromStorage(): NavigationHistory | null {
    const stored = this.storageService.getSessionStorage(EnumStorageKey.NavigationHistory);
    return stored || null;
  }
}
