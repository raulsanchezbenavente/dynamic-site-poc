import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ConfigService, CultureServiceEx } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, finalize, map, shareReplay, takeUntil, timeout } from 'rxjs/operators';

import { ModuleTranslation } from '../models/module-translation.model';
import { TranslationApiResult } from '../models/translations-api-result';

@Injectable({
  providedIn: 'root',
})
export class ModuleTranslationService {
  private readonly loadedModules = new Set<string>();
  private readonly loadedModulesSignal = signal<Record<string, boolean>>({});
  public readonly loadedModules$ = this.loadedModulesSignal.asReadonly();
  private readonly pendingModules = new Map<string, Observable<TranslationApiResult>>();
  private readonly configService = inject(ConfigService);
  private readonly translateService = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly endpointPath = 'GetByCultureAndKeys';
  private readonly destroy$ = new Subject<void>();
  private readonly REQUEST_TIMEOUT = 10000;

  /**
   * Load translations for a specific module or modules
   * @param config Module translation configuration
   * @returns Observable that completes when translations are loaded
   */
  public loadModuleTranslations(config: ModuleTranslation): Observable<TranslationApiResult> {
    const currentLang: string = this.cultureServiceEx.getLanguageAndRegion();
    const moduleNames = Array.isArray(config.moduleName) ? config.moduleName : [config.moduleName];
    const modulesInProgress: Observable<TranslationApiResult>[] = [];
    const modulesNotStarted: string[] = [];

    const modulesToLoad = moduleNames.filter((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      return !this.loadedModules.has(translationKey);
    });

    if (modulesToLoad.length === 0) {
      return of({ success: true, data: {} });
    }

    modulesToLoad.forEach((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      const pendingRequest = this.pendingModules.get(translationKey);

      if (pendingRequest) {
        modulesInProgress.push(pendingRequest);
      } else {
        modulesNotStarted.push(moduleName);
      }
    });

    if (modulesInProgress.length > 0) {
      return forkJoin(modulesInProgress).pipe(
        concatMap(() => this.loadRemainingModules(modulesNotStarted, currentLang))
      );
    }

    return this.makeTranslationRequest(modulesNotStarted, currentLang);
  }

  private loadRemainingModules(moduleNames: string[], currentLang: string): Observable<TranslationApiResult> {
    const stillToLoad = moduleNames.filter((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      return !this.loadedModules.has(translationKey);
    });

    if (stillToLoad.length === 0) {
      return of({ success: true, data: {} });
    }

    return this.makeTranslationRequest(stillToLoad, currentLang);
  }

  /**
   * Generate cache key for module + language combination
   * @param moduleName Name of the module
   * @param language Language code
   * @returns Cache key string
   */
  private getTranslationKey(moduleName: string, language: string): string {
    return `${moduleName}_${language}`;
  }

  private handleSuccess(
    translations: Record<string, string>,
    moduleNames: string[],
    currentLang: string
  ): TranslationApiResult {
    this.translateService.setTranslation(currentLang, translations, true);
    this.translateService.use(currentLang);
    this.translateService.setFallbackLang(currentLang);

    moduleNames.forEach((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      this.loadedModules.add(translationKey);
    });

    this.loadedModulesSignal.update((current) => {
      const updated = { ...current };
      moduleNames.forEach((moduleName) => {
        updated[moduleName] = true;
      });
      return updated;
    });

    return { success: true, data: translations };
  }

  private handleError(error: any, moduleNames: string[], currentLang: string): Observable<TranslationApiResult> {
    moduleNames.forEach((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      this.loadedModules.delete(translationKey);
    });

    const isAbortError =
      (error.name === 'HttpErrorResponse' && error.status === 0) ||
      error.error === 'abort' ||
      error.error?.type === 'abort' ||
      error.statusText === 'Unknown Error';
    const isTimeoutError = error.name === 'TimeoutError';

    if (!isAbortError && !isTimeoutError) {
      const moduleNamesStr = moduleNames.join(', ');
      console.error(`[ModuleTranslationService] Error loading translations for ${moduleNamesStr}:`, error);
    }

    return of({ success: false, data: {} });
  }

  private cleanupPendingModules(moduleNames: string[], currentLang: string): void {
    moduleNames.forEach((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      this.pendingModules.delete(translationKey);
    });
  }

  private registerPendingModules(
    moduleNames: string[],
    currentLang: string,
    request$: Observable<TranslationApiResult>
  ): void {
    moduleNames.forEach((moduleName) => {
      const translationKey = this.getTranslationKey(moduleName, currentLang);
      this.pendingModules.set(translationKey, request$);
    });
  }

  /**
   * Make HTTP request to load translations for specified modules
   * @param moduleNames Array of module names to load
   * @param currentLang Current language code
   * @returns Observable with translation result
   */
  private makeTranslationRequest(moduleNames: string[], currentLang: string): Observable<TranslationApiResult> {
    const translationUrl = this.buildTranslationUrl(moduleNames, currentLang);

    const request$ = this.http.get<Record<string, string>>(translationUrl).pipe(
      timeout(this.REQUEST_TIMEOUT),
      takeUntil(this.destroy$),
      map((translations) => this.handleSuccess(translations, moduleNames, currentLang)),
      catchError((error) => this.handleError(error, moduleNames, currentLang)),
      finalize(() => this.cleanupPendingModules(moduleNames, currentLang)),
      shareReplay(1)
    );

    this.registerPendingModules(moduleNames, currentLang, request$);
    return request$;
  }

  /**
   * Build the translation API URL using ConfigService
   * @param moduleNames Array of module names (e.g., ['Common', 'MainFooter'])
   * @param culture Language culture (e.g., 'en-US', 'es-ES')
   * @returns Complete API URL
   */
  private buildTranslationUrl(moduleNames: string[], culture: string): string {
    const mainConfig = this.configService.getMainConfig();
    const baseUrl = mainConfig.staticTranslationUrl.replace(/\/$/, '');

    const url = new URL(`${baseUrl}/${this.endpointPath}`);
    url.searchParams.set('culture', culture);
    url.searchParams.set('keys', moduleNames.join(','));

    return url.toString();
  }

  /**
   * Check if a module is already loaded
   * @param moduleName Name of the module
   * @returns True if the module is loaded, false otherwise
   */
  public isModuleLoaded(moduleName: string): boolean {
    return this.loadedModulesSignal()[moduleName] ?? false;
  }
}
