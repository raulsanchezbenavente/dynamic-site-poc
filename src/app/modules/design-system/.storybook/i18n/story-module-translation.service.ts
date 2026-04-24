import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
// All comments in English (project rule)
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { STORY_DICTIONARY, TRANSLATION_BASE_URL } from './tokens';

export type StoryDictionary = Record<string, string>;

/**
 * Storybook translation loader (DS/BC stories).
 *
 * Responsibilities:
 * - Loads keys for one or more modules via TRANSLATION_BASE_URL (GetByCultureAndKeys), when available.
 * - Accepts the AutoTranslateDirective shape ({ moduleName: string | string[] }) as well as plain forms ('Common', ['Common']) and { module|modules|keys }.
 * - Merges dictionaries as: API > STORY_DICTIONARY (mock). Converts flat keys ("Common.A11y.Foo": "...") into the nested object expected by ngx-translate.
 * - Applies dictionaries with setTranslation(..., merge=true) and ensures the active language via setFallbackLang(...) + use(...). It does NOT call resetLang (to avoid clearing the store).
 * - Reads TRANSLATION_BASE_URL and STORY_DICTIONARY from the module injector at call time, so per-story overrides are honored (no global provider needed).
 * - Memoizes by (lang|keys|baseUrl|mockSig) to prevent duplicate HTTP calls.
 */

@Injectable({ providedIn: 'any' })
export class StoryModuleTranslationService {
  // Cache per (lang + modules + baseUrl + mock signature)
  private readonly cache = new Map<string, Observable<unknown>>();
  // Track loaded modules for quick checks (module name as key)
  private readonly loadedModules = new Set<string>();
  private readonly loadedModulesSignal = signal<Record<string, boolean>>({});
  public readonly loadedModules$ = this.loadedModulesSignal.asReadonly();

  private readonly translate = inject(TranslateService);
  private readonly http = inject(HttpClient, { optional: true });
  private readonly injector = inject(Injector);

  /** Resolve tokens at call time so per-story overrides are visible. */
  private resolveConfig(): { baseUrl?: string; mock: StoryDictionary } {
    const base = this.injector.get(TRANSLATION_BASE_URL, undefined);
    const dict = this.injector.get(STORY_DICTIONARY, {} as StoryDictionary);
    return { baseUrl: base ?? undefined, mock: dict ?? {} };
  }

  private applyDict(lang: string, dict: Record<string, string>): void {
    if (!dict || !Object.keys(dict).length) return;
    this.ensureLangActive(lang);
    this.translate.setTranslation(lang, this.toNested(dict), true);
  }

  private ensureLangActive(lang: string): void {
    this.translate.setFallbackLang(lang);
    if (this.translate.getCurrentLang && this.translate.getCurrentLang() !== lang) {
      this.translate.use(lang);
    }
  }

  /** Accepts: 'Common' | ['Common','Navigation'] | { module: 'Common' } | { moduleName: 'Common' | string[] } | { keys: [...] } */
  public loadModuleTranslations(spec: unknown): Observable<unknown> {
    const lang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es-ES';

    // Read tokens now (not at construction time)
    const { baseUrl, mock } = this.resolveConfig();

    const keysCsv = this.normalizeModules(spec, mock);

    console.log('[SB-i18n] start', {
      lang,
      keysCsv,
      hasHttp: !!this.http,
      baseUrl,
      mockPreview: Object.fromEntries(Object.entries(mock).slice(0, 50)),
    });

    // NO KEYS: No keys → apply mock only (if present) and complete
    if (!keysCsv) {
      if (Object.keys(mock).length) {
        this.applyDict(lang, mock);
      } else {
        // Helpful for diagnosing missing directive spec in stories
        // (e.g., <ng-container [appAutoTranslate]="'Common'"></ng-container> not present)
        console.warn('[i18n] No keys to load and no mock provided.');
      }
      return of({ success: true, data: {} } as const);
    }

    const moduleNames = keysCsv.split(',').map((k) => k.trim());

    // Stronger cache key includes baseUrl and mock signature to avoid poisoned cache reuse
    const mockSig = Object.keys(mock).length; // could be replaced by a hash if needed
    const apiSig = baseUrl ?? 'no-api';
    const cacheKey = `${lang}|${keysCsv}|${apiSig}|mock:${mockSig}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('[SB-i18n] cache hit', cacheKey);
      return cached;
    }

    // MOCK-ONLY: If no API available, apply mock and cache
    if (!this.http || !baseUrl) {
      const done$ = of(null).pipe(
        map(() => {
          this.applyDict(lang, mock);
          // Mark modules as loaded
          moduleNames.forEach((name) => this.loadedModules.add(name));
          this.loadedModulesSignal.update((current) => {
            const updated = { ...current };
            moduleNames.forEach((name) => {
              updated[name] = true;
            });
            return updated;
          });
          return { success: true, data: {} } as const;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.cache.set(cacheKey, done$);
      return done$;
    }

    // API: API request and merge: API > mock
    const url = `${baseUrl.replace(/\/$/, '')}/GetByCultureAndKeys`;

    if (Object.keys(mock).length) {
      this.applyDict(lang, mock);
    }

    const req$ = this.http.get<Record<string, string>>(url, { params: { culture: lang, keys: keysCsv } }).pipe(
      catchError((err) => {
        console.warn('[SB-i18n] api error, fallback to mock', err);
        return of({} as Record<string, string>);
      }),
      map((api) => {
        const hasApi = api && Object.keys(api).length > 0;

        if (hasApi) {
          this.applyDict(lang, api);

          if (Object.keys(mock).length) {
            this.applyDict(lang, mock);
          }
          console.log('[SB-i18n] api merged (api→mock), keys:', Object.keys(api).length);
        } else {
          console.log('[SB-i18n] api returned empty, keeping mock only');
        }

        // Mark modules as loaded
        moduleNames.forEach((name) => this.loadedModules.add(name));
        this.loadedModulesSignal.update((current) => {
          const updated = { ...current };
          moduleNames.forEach((name) => {
            updated[name] = true;
          });
          return updated;
        });

        return { success: true, data: (api && Object.keys(api).length ? api : {}) } as const;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(cacheKey, req$);
    return req$;
  }

  /** Converts the directive arg into a CSV list of module names. */
  private normalizeModules(spec: unknown, mock: StoryDictionary): string {
    if (typeof spec === 'string') return spec;
    if (Array.isArray(spec)) return spec.join(',');
    if (spec && typeof spec === 'object') {
      const o = spec as any;

      // Support AutoTranslateDirective shape
      if (typeof o.moduleName === 'string') return o.moduleName;
      if (Array.isArray(o.moduleName)) return o.moduleName.join(',');

      if (typeof o.module === 'string') return o.module;
      if (Array.isArray(o.modules)) return o.modules.join(',');
      if (Array.isArray(o.keys)) return o.keys.join(',');
    }
    const firstKey = Object.keys(mock)[0];
    if (firstKey?.includes('.')) return firstKey.split('.')[0];
    return '';
  }

  // Treat folder markers (null/empty, no dot) as branches; only '.' defines hierarchy.
  // If a leaf clashes with a branch, prefer the branch and (optionally) preserve the old leaf in ._value.
  // Underscores are literal (never split).
  private toNested(dict: Record<string, string | null | undefined>): Record<string, any> {
    const root: Record<string, any> = {};
    const isBranch = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

    for (const [fullKey, rawValue] of Object.entries(dict)) {
      const parts = fullKey.split('.');
      let node: any = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];

        if (!isBranch(node[k])) {
          if (node[k] !== undefined) {
            node[k] = { ['_value']: node[k] };
          } else {
            node[k] = {};
          }
        }
        node = node[k];
      }

      const leaf = parts[parts.length - 1];

      const isFolderMarker = (rawValue === null || rawValue === '' || rawValue === undefined) && parts.length === 1;
      if (isFolderMarker) {
        if (!isBranch(node[leaf])) node[leaf] = {};
        continue;
      }

      if (isBranch(node[leaf])) {
        node[leaf]['_value'] = rawValue ?? ''; // <- corchetes

        console.warn('[SB-i18n] Leaf collision on object. Stored at', `${fullKey}._value`);
      } else {
        node[leaf] = rawValue ?? '';
      }
    }
    return root;
  }

  /**
   * Checks if a module has been loaded previously.
   * @param moduleName Name of the module to check
   * @returns True if the module has been loaded previously
   */
  public isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }
}
