import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ModuleTranslation } from '../../lib/models/module-translation.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleTranslationServiceFake {
  private readonly loadedModules = new Set<string>();

  /**
   * Mock implementation for loading module translations
   * @param config Module translation configuration
   * @returns Observable that completes when translations are loaded
   */
  public loadModuleTranslations(config: ModuleTranslation): Observable<any> {
    const moduleName = Array.isArray(config.moduleName) ? config.moduleName.join(',') : config.moduleName;
    const cacheKey = this.getCacheKey(moduleName, 'es-ES');

    if (this.loadedModules.has(cacheKey)) {
      return of(true);
    }

    // Mock translations for the module
    const mockTranslations = {
      [`${config.moduleName}.mock.key`]: `Mock translation for ${config.moduleName}`,
      [`${config.moduleName}.test.message`]: `Test message from ${config.moduleName} module`,
    };

    this.loadedModules.add(cacheKey);

    console.log(`[ModuleTranslationServiceFake] Mock loaded translations for ${config.moduleName}:`, mockTranslations);

    return of(mockTranslations);
  }

  /**
   * Generate cache key for module + language combination
   * @param moduleName Name of the module
   * @param language Language code
   * @returns Cache key string
   */
  private getCacheKey(moduleName: string, language: string): string {
    return `${moduleName}_${language}`;
  }
}
