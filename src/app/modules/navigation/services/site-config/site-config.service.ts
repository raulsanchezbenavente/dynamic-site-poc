import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { TabConfigEntry, TabSummary } from '../../../dynamic-composite/dynamic-tabs/models/tab-config.model';

import { AppLang } from './models/langs.model';
import {
    SiteBlockConfig,
    SiteConfigResponse,
    SiteLayout,
    SiteLayoutCol,
    SiteLayoutRow,
    SitePage,
} from './models/site-config.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private static readonly SESSION_STORAGE_KEY = 'dynamic-site.site-config-by-language.v1';
  private readonly http = inject(HttpClient);
  private readonly _siteSubject = new BehaviorSubject<SiteConfigResponse | null>(null);
  public readonly site$ = this._siteSubject.asObservable();
  public configSitesByLanguage: Partial<Record<AppLang, SitePage[]>> = {};
  private readonly fullConfigSitesByLanguage: Partial<Record<AppLang, SitePage[]>> = {};
  private readonly visitedPathsByLanguage = new Map<AppLang, Set<string>>();
  private hasHydratedFromSessionStorage = false;

  constructor() {}

  public clearPersistedSiteConfigFromSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(SiteConfigService.SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage access failures.
    }
  }

  public loadSite(langs: AppLang[] | string[]): Observable<SiteConfigResponse> {
    this.hydrateFromSessionStorageOnce();

    const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso

    // Rehydrate requested languages from full cache.
    // This prevents serving a partial (pruned) language when the user switches back to it.
    uniqueLangs.forEach((lang) => {
      const appLang = lang as AppLang;
      const fullPages = this.fullConfigSitesByLanguage[appLang];
      if (fullPages?.length) {
        this.configSitesByLanguage[appLang] = [...fullPages];
      }
    });
    this.persistConfigToSessionStorage();

    const missingLangs = uniqueLangs.filter((lang) => {
      const appLang = lang as AppLang;
      return !this.configSitesByLanguage[appLang]?.length;
    });

    if (!missingLangs.length) {
      return of(this.getMergedSiteConfig()).pipe(tap((mergedSite) => this.publishMergedSiteConfig(mergedSite)));
    }

    const requests = missingLangs.map((lang) => this.http.get<SiteConfigResponse>(this.getURlFromLangAndContext(lang)));

    return forkJoin(requests).pipe(
      switchMap((sites) => forkJoin(sites.map((site) => this.resolveSiteLayouts(site)))),
      tap((sites) => {
        const loadedSitesByLanguage = missingLangs.reduce(
          (acc, lang, idx) => {
            const pages = Array.isArray(sites?.[idx]?.pages) ? sites[idx].pages : [];
            acc[lang as AppLang] = pages;
            return acc;
          },
          {} as Record<AppLang, SitePage[]>
        );

        this.configSitesByLanguage = {
          ...this.configSitesByLanguage,
          ...(loadedSitesByLanguage as Partial<Record<AppLang, SitePage[]>>),
        };

        this.updateFullLanguageCache(loadedSitesByLanguage as Partial<Record<AppLang, SitePage[]>>);
      }),
      map(() => this.getMergedSiteConfig()),
      tap((mergedSite) => this.publishMergedSiteConfig(mergedSite))
    );
  }

  private getMergedSiteConfig(): SiteConfigResponse {
    const mergedPages: SitePage[] = Object.values(this.configSitesByLanguage).flatMap((pages) => pages ?? []);
    return { pages: mergedPages };
  }

  private getURlFromLangAndContext(lang: string): string {
    return '/assets/config-site/' + lang;
  }

  public get siteSnapshot(): SiteConfigResponse | null {
    return this._siteSubject.value;
  }

  public getPagesByLang(lang: AppLang): SitePage[] {
    return this.configSitesByLanguage[lang] ?? [];
  }

  public getBlockConfig(pageId: string, componentName: string, lang: AppLang): SiteBlockConfig | undefined {
    const pages = this.getPagesByLang(lang);
    const page = pages.find((p) => String(p?.pageId ?? '') === String(pageId));
    if (!page) {
      return undefined;
    }
    const rows = this.getLayoutRows(page.layout);
    for (const row of rows) {
      for (const col of Array.isArray(row?.cols) ? row.cols : []) {
        if (col?.component === componentName) {
          return col.config ?? undefined;
        }
      }
    }
    return undefined;
  }

  public getPathByPageId(pageId: string | undefined, lang: AppLang): string | undefined {
    if (pageId === undefined || pageId === null) return undefined;
    const pages = this.configSitesByLanguage[lang] ?? [];
    const idStr = String(pageId);
    const page = pages.find((p) => String(p?.pageId ?? '') === idStr);
    return page?.path;
  }

  public getTabsIdByPageId(pageId: string | undefined, lang: AppLang): string | undefined {
    if (pageId === undefined || pageId === null) return undefined;

    const pages = this.configSitesByLanguage[lang] ?? [];
    const idStr = String(pageId);
    const page = pages.find((candidate) => String(candidate?.pageId ?? '') === idStr);
    if (!page) {
      return undefined;
    }

    const rows = this.getLayoutRows(page.layout);
    const cols: SiteLayoutCol[] = Array.isArray(rows) ? rows.flatMap((row: SiteLayoutRow) => row?.cols ?? []) : [];

    for (const col of cols) {
      const tabsConfig = (col?.config ?? null) as { tabsId?: string | number } | null;
      const tabsId = tabsConfig?.tabsId;
      if (tabsId !== undefined && tabsId !== null && String(tabsId).trim().length > 0) {
        return String(tabsId);
      }
    }

    return undefined;
  }

  public getTabNamesByTabsId(tabsId: string | number, lang?: AppLang): TabSummary[] {
    const tabsIdStr = String(tabsId);
    const pages = lang ? (this.configSitesByLanguage[lang] ?? []) : Object.values(this.configSitesByLanguage).flat();

    const tabMap = new Map<string, TabSummary>();

    for (const page of pages) {
      const rows = this.getLayoutRows(page.layout);
      const cols: SiteLayoutCol[] = Array.isArray(rows) ? rows.flatMap((row: SiteLayoutRow) => row?.cols ?? []) : [];

      for (const col of cols) {
        const tabsConfig = (col?.config ?? null) as { tabsId?: string | number; tabs?: TabConfigEntry[] } | null;
        if (String(tabsConfig?.tabsId ?? '') !== tabsIdStr) continue;
        const tabs = Array.isArray(tabsConfig?.tabs) ? tabsConfig.tabs : [];
        tabs.forEach((tab: TabConfigEntry) => {
          const name = tab?.name ? String(tab.name) : '';
          if (!name) return;
          if (!tabMap.has(name)) {
            tabMap.set(name, {
              name,
              title: tab?.title ? String(tab.title) : undefined,
              secondaryText: tab?.secondaryText ? String(tab.secondaryText) : undefined,
              tabId: tab?.tabId ? String(tab.tabId) : undefined,
            });
          }
        });
      }
    }

    return Array.from(tabMap.values());
  }

  public markRouteAsVisited(lang: AppLang, path: string): void {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) {
      return;
    }

    const visitedPaths = this.visitedPathsByLanguage.get(lang) ?? new Set<string>();
    visitedPaths.add(normalizedPath);
    this.visitedPathsByLanguage.set(lang, visitedPaths);
  }

  public pruneLanguageKeepingVisitedRoutes(lang: AppLang): void {
    const pages = this.configSitesByLanguage[lang] ?? [];
    if (!pages.length) {
      return;
    }

    const visitedPaths = this.visitedPathsByLanguage.get(lang) ?? new Set<string>();
    const keptPages = pages.filter((page) => visitedPaths.has(this.normalizePath(page?.path ?? '')));

    if (!keptPages.length) {
      delete this.configSitesByLanguage[lang];
      this.publishMergedSiteConfig(this.getMergedSiteConfig());
      return;
    }

    this.configSitesByLanguage[lang] = keptPages;
    this.publishMergedSiteConfig(this.getMergedSiteConfig());
  }

  public removeLanguage(lang: AppLang): void {
    if (!this.configSitesByLanguage[lang]) {
      return;
    }

    delete this.configSitesByLanguage[lang];
    this.publishMergedSiteConfig(this.getMergedSiteConfig());
  }

  private publishMergedSiteConfig(mergedSite: SiteConfigResponse): void {
    this._siteSubject.next(mergedSite);
    this.persistConfigToSessionStorage();
  }

  private persistConfigToSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(
        SiteConfigService.SESSION_STORAGE_KEY,
        JSON.stringify({ configSitesByLanguage: this.configSitesByLanguage })
      );
    } catch {
      // Ignore storage quota and serialization failures.
    }
  }

  private restoreConfigFromSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      const raw = sessionStorage.getItem(SiteConfigService.SESSION_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        configSitesByLanguage?: Partial<Record<AppLang, SitePage[]>>;
      };

      if (!parsed?.configSitesByLanguage || typeof parsed.configSitesByLanguage !== 'object') {
        return;
      }

      this.configSitesByLanguage = parsed.configSitesByLanguage;
      this.updateFullLanguageCache(this.configSitesByLanguage);
      this._siteSubject.next(this.getMergedSiteConfig());
    } catch {
      // Ignore malformed persisted data.
    }
  }

  private hydrateFromSessionStorageOnce(): void {
    if (this.hasHydratedFromSessionStorage) {
      return;
    }

    this.hasHydratedFromSessionStorage = true;
    this.restoreConfigFromSessionStorage();
  }

  private updateFullLanguageCache(loadedSitesByLanguage: Partial<Record<AppLang, SitePage[]>>): void {
    const entries = Object.entries(loadedSitesByLanguage) as Array<[AppLang, SitePage[]]>;
    for (const [lang, pages] of entries) {
      this.fullConfigSitesByLanguage[lang] = [...(pages ?? [])];
    }
  }

  private normalizePath(path: string): string {
    const basePath = path.split('?')[0].split('#')[0].trim();
    if (!basePath) {
      return '';
    }

    const withoutLeadingSlash = basePath.startsWith('/') ? basePath.slice(1) : basePath;
    let decodedPath = withoutLeadingSlash;
    try {
      // Browser URLs may contain percent-encoded accents (e.g. r%C3%A9sultats).
      // Decode before comparing with config paths that often come as unicode.
      decodedPath = decodeURIComponent(withoutLeadingSlash);
    } catch {
      decodedPath = withoutLeadingSlash;
    }

    if (decodedPath.length > 1 && decodedPath.endsWith('/')) {
      return decodedPath.slice(0, -1);
    }

    return decodedPath;
  }

  private resolveSiteLayouts(site: SiteConfigResponse): Observable<SiteConfigResponse> {
    const pages = Array.isArray(site?.pages) ? site.pages : [];
    if (!pages.length) {
      return of({ pages: [] });
    }

    return forkJoin(pages.map((page) => this.resolvePageLayout(page))).pipe(map((resolvedPages) => ({ pages: resolvedPages })));
  }

  private resolvePageLayout(page: SitePage): Observable<SitePage> {
    if (typeof page?.layout !== 'string') {
      return of(page);
    }

    const layoutUrl = page.layout.trim();
    if (!layoutUrl) {
      return of({ ...page, layout: { rows: [] } });
    }

    return this.http.get<SiteLayout | SiteLayoutRow[]>(layoutUrl).pipe(
      map((layoutResponse) => ({ ...page, layout: this.normalizeLayout(layoutResponse) })),
      catchError((error) => {
        console.warn('[SiteConfigService] Failed to resolve layout URL', { layoutUrl, pageId: page?.pageId, error });
        return of({ ...page, layout: { rows: [] } });
      })
    );
  }

  private normalizeLayout(layout: SiteLayout | SiteLayoutRow[] | null | undefined): SiteLayout | SiteLayoutRow[] {
    if (Array.isArray(layout)) {
      return layout;
    }

    return {
      rows: Array.isArray(layout?.rows) ? layout.rows : [],
    };
  }

  private getLayoutRows(layout: SitePage['layout']): SiteLayoutRow[] {
    if (Array.isArray(layout)) {
      return layout;
    }

    if (typeof layout === 'string') {
      return [];
    }

    return layout?.rows ?? [];
  }
}
