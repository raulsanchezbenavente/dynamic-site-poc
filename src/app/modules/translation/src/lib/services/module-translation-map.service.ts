import { inject, Injectable } from '@angular/core';
import { ModuleTranslationService } from '@dcx/module/translation';
import { Observable } from 'rxjs';

import { MODULE_TRANSLATION_MAP } from '../config/module-translation-map';
import { TranslationApiResult } from '../models/translations-api-result';

@Injectable({
  providedIn: 'root',
})
export class ModuleTranslationMapService {
  private readonly moduleTranslationService = inject(ModuleTranslationService);

  public preLoadTranslations(moduleNames: string[]): Observable<TranslationApiResult> | null {
    const translationKeys = new Set<string>();

    for (const moduleName of moduleNames) {
      const translations = MODULE_TRANSLATION_MAP[moduleName];

      if (translations && Array.isArray(translations)) {
        translations.forEach((key) => translationKeys.add(key));
      } else {
        console.warn(`[ModuleTranslationMapService] No translations configured for module: ${moduleName}`);
      }
    }

    const uniqueTranslations = Array.from(translationKeys);
    if (uniqueTranslations.length > 0) {
      return this.moduleTranslationService.loadModuleTranslations({
        moduleName: uniqueTranslations,
      });
    }

    return null;
  }
}
