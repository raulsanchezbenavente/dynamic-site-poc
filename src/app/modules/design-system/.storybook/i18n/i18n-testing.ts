import { Provider } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';

/** Minimal fake loader (no HTTP). Returns the provided dict as-is. */
export class TranslateMemoryLoader implements TranslateLoader {
  constructor(private readonly dict: Record<string, any> = {}) {}
  public getTranslation() {
    // Always return the dict regardless of lang
    return of(this.dict);
  }
}

/**
 * Use this when the template uses the |translate pipe.
 * Example:
 *   imports: [
 *     ...i18nTestingImportsWithMemoryLoader({ 'Common.Next': 'Next' })
 *   ]
 */
export function i18nTestingImportsWithMemoryLoader(dict: Record<string, any> = {}): any[] {
  return [
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useValue: new TranslateMemoryLoader(dict) },
    }),
  ];
}

/**
 * Use this when only instant()/get() is called in TS code.
 * Provides a stub service instead of the pipe.
 */
export function i18nTestingProvidersWithServiceStub(dict: Record<string, string> = {}): Provider[] {
  const stub: Partial<TranslateService> = {
    instant: (key: string) => dict[key] ?? key,
    get: (key: string) => of(dict[key] ?? key),
    onLangChange: EMPTY,
    onTranslationChange: EMPTY,
    onDefaultLangChange: EMPTY,
    getCurrentLang: () => 'en-US',
    setFallbackLang: () => of({}),
  };

  return [
    {
      provide: TranslateService,
      useValue: stub,
    },
  ];
}
