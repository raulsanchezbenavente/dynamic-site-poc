import { computed, Directive, effect, inject, input, output } from '@angular/core';

import { TranslationsLoaded } from '../models/translation-loaded.model';
import { ModuleTranslationService } from '../services/module-translation.service';

@Directive({
  selector: '[translationLoadStatus]',
  standalone: true,
})
export class TranslationLoadStatusDirective {
  public moduleKeys = input.required<string | string[]>();
  public translationsLoaded = output<TranslationsLoaded>();

  private readonly moduleTranslationService = inject(ModuleTranslationService);
  private readonly loadedModules = this.moduleTranslationService.loadedModules$;

  private readonly areKeysLoaded = computed(() => {
    const moduleKeysArray: string[] = Array.isArray(this.moduleKeys())
      ? (this.moduleKeys() as string[])
      : [this.moduleKeys() as string];

    if (moduleKeysArray.length === 0) {
      return true;
    }

    const loadedModulesValue = this.loadedModules();

    return moduleKeysArray.every((moduleName) => loadedModulesValue[moduleName] === true);
  });

  constructor() {
    effect(() => {
      if (this.areKeysLoaded()) {
        this.translationsLoaded.emit({ success: true, data: {} });
      }
    });
  }
}
