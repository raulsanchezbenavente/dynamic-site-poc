/**
 * Shared Storybook Preview Configuration
 *
 * This file provides common configuration that all preview.ts files can import and extend.
 * Instead of duplicating decorators, parameters, and initialization logic across all modules,
 * they can import and spread this configuration.
 *
 */

import { type Provider, type EnvironmentProviders } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeGr from '@angular/common/locales/el';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeKk from '@angular/common/locales/kk';
import localePt from '@angular/common/locales/pt';
import localeRu from '@angular/common/locales/ru';
import localeTr from '@angular/common/locales/tr';
import { applicationConfig, type Preview } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { ModuleTranslationService } from '@dcx/module/translation';
import { Observable, of } from 'rxjs';
import { withStoryTranslationsAuto } from '../i18n/with-story-translations-auto.decorator';
import { StoryModuleTranslationService } from '../i18n/story-module-translation.service';
import { TRANSLATION_BASE_URL, STORY_DICTIONARY } from '../i18n/tokens';
import { initKeyboardFocusDetection } from '@dcx/ui/libs';

/**
 * Empty loader — translations are injected later by a per-story provider.
 * This class is exported to avoid duplication across preview.ts files.
 */
export class EmptyLoader implements TranslateLoader {
  getTranslation(_lang: string): Observable<Record<string, string>> {
    return of({});
  }
}

/**
 * Default translation base URL used across all Storybooks
 * Can be overridden in individual preview.ts files if needed
 */
export const DEFAULT_TRANSLATION_BASE_URL = 'https://av-booking-test2.newshore.es/configuration/api/v1/UI_PLUS/Translation';

/**
 * Registers all Angular locale data for internationalization support.
 * This enables proper formatting of dates, numbers, and currencies across all supported locales.
 *
 * Call this once at the beginning of your preview.ts file:
 * ```typescript
 * import { registerAllLocales } from '@dcx/ui/storybook-utils';
 * registerAllLocales();
 * ```
 */
export function registerAllLocales(): void {
  const locales = [
    { data: localeDe, code: 'de-DE' },
    { data: localeEs, code: 'es-ES' },
    { data: localeIt, code: 'it-IT' },
    { data: localePt, code: 'pt-BR' },
    { data: localeRu, code: 'ru-RU' },
    { data: localeTr, code: 'tr-TR' },
    { data: localeFr, code: 'fr-FR' },
    { data: localeKk, code: 'kk-KZ' },
    { data: localeGr, code: 'el-GR' },
  ];

  locales.forEach(({ data, code }) => registerLocaleData(data, code));
}

/**
 * Creates shared base providers for Storybook decorators
 * This is a helper to avoid duplicating the base provider setup
 */
export function createBaseProviders(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withInterceptorsFromDi()),
    ...provideTranslateService({ lang: 'es-ES', fallbackLang: 'es-ES' }),
    provideTranslateLoader(EmptyLoader),
    {
      provide: TRANSLATION_BASE_URL,
      useValue: DEFAULT_TRANSLATION_BASE_URL,
    },
    { provide: STORY_DICTIONARY, useValue: {} },
    // Default translation service used by all modules
    // Can be overridden by passing a different provider in additionalProviders
    { provide: ModuleTranslationService, useClass: StoryModuleTranslationService },
  ];
}

/**
 * Creates shared decorators with optional additional providers
 * Use this to extend the base configuration with module-specific providers
 *
 * @param additionalProviders - Optional array of additional Angular providers
 * @param additionalDecorators - Optional array of additional Storybook decorators
 * @returns Array of Storybook decorators
 *
 * @example
 * ```typescript
 * // Basic usage - no additional providers needed
 * const decorators = createSharedDecorators();
 *
 * // With additional providers
 * import { AuthService } from '@dcx/ui/libs';
 * const decorators = createSharedDecorators([
 *   { provide: AuthService, useClass: AuthServiceMock }
 * ]);
 * ```
 */
export function createSharedDecorators(
  additionalProviders: (Provider | EnvironmentProviders)[] = [],
  additionalDecorators: any[] = []
): any[] {
  return [
    applicationConfig({
      providers: [
        ...createBaseProviders(),
        ...additionalProviders,
      ],
    }),
    withStoryTranslationsAuto,
    ...additionalDecorators,
  ];
}

/**
 * Shared decorators used across all Storybook instances
 * Uses the createSharedDecorators helper for consistency
 */
export const sharedDecorators = createSharedDecorators();

/**
 * Shared parameters used across all Storybook instances
 */
export const sharedParameters = {
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  // Disable API calls in Storybook by default, use mocks instead
  // Individual stories can override with i18n: { api: true } if needed
  i18n: {
    api: false,
  },
  // Standard story sort order for all modules
  options: {
    storySort: {
      method: 'alphabetical' as const,
      order: ['Overview', 'Guidelines', 'Atoms', 'Molecules', 'Organisms', 'Main'],
      locales: 'en-US',
    },
  },
};

/**
 * Shared initial globals
 */
export const sharedInitialGlobals = {
  backgrounds: { grid: false },
};

/**
 * Complete shared preview configuration
 * This can be spread into any module's preview.ts file
 */
export const sharedPreviewConfig: Preview = {
  decorators: sharedDecorators,
  parameters: sharedParameters,
  // Note: initialGlobals is intentionally not included here as it's module-specific
};

/**
 * Initialize shared Storybook functionality
 * This is called automatically when this module is imported.
 * No need to call it explicitly in your preview.ts files.
 *
 * @deprecated Use the automatic initialization by importing sharedPreviewConfig.
 * This function is kept for backward compatibility but will be removed in future versions.
 */
export function initializeStorybook(): void {
  initKeyboardFocusDetection();
}

// Auto-initialize when this module is loaded
// This runs once per Storybook instance, avoiding code duplication
initKeyboardFocusDetection();
