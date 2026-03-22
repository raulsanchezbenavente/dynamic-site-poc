import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AppLang } from './models/langs.model';
import {
    SiteBlockConfig,
    SiteConfigResponse,
    SiteLayoutCol,
    SiteLayoutRow,
    SitePage,
    SiteTab,
    SiteTabSummary,
} from './models/site-config.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly http = inject(HttpClient);
  private readonly _siteSubject = new BehaviorSubject<SiteConfigResponse | null>(null);
  public readonly site$ = this._siteSubject.asObservable();
  public configSitesByLanguage: Partial<Record<AppLang, SitePage[]>> = {};
  private pinnedInitialPagePath: string | null = null;
  private pinnedInitialPageId: string | null = null;

  public keepOnlyLanguages(langs: AppLang[]): void {
    const allowed = new Set<AppLang>(langs);
    const nextConfig: Partial<Record<AppLang, SitePage[]>> = {};

    (Object.keys(this.configSitesByLanguage) as AppLang[]).forEach((lang) => {
      if (allowed.has(lang)) {
        nextConfig[lang] = this.configSitesByLanguage[lang] ?? [];
      }
    });

    this.configSitesByLanguage = nextConfig;
    this._siteSubject.next({
      pages: Object.values(this.configSitesByLanguage).flatMap((pages) => (Array.isArray(pages) ? pages : [])),
    });
  }

  public keepOnlyCurrentRouteForLanguage(
    lang: AppLang,
    currentPageId: string | undefined,
    currentPath: string | undefined
  ): void {
    const pages = this.configSitesByLanguage[lang] ?? [];
    const normalizedPageId = String(currentPageId ?? '').trim();
    const normalizedPath = String(currentPath ?? '').trim().replace(/^\//, '');

    const keptPages = pages.filter((page) => {
      const samePageId = normalizedPageId && String(page?.pageId ?? '') === normalizedPageId;
      const samePath = normalizedPath && String(page?.path ?? '').replace(/^\//, '') === normalizedPath;
      return Boolean(samePageId || samePath);
    });

    this.configSitesByLanguage = {
      [lang]: keptPages,
    };

    this._siteSubject.next({
      pages: keptPages,
    });
  }

  public prepareForLanguageSwitch(
    initialLang: AppLang,
    sourceLang: AppLang,
    currentPageId: string | undefined,
    currentPath: string | undefined
  ): void {
    const normalizedPath = String(currentPath ?? '').trim().replace(/^\//, '');
    const normalizedPageId = String(currentPageId ?? '').trim();

    if (sourceLang === initialLang) {
      this.pinnedInitialPagePath = normalizedPath || this.pinnedInitialPagePath;
      this.pinnedInitialPageId = normalizedPageId || this.pinnedInitialPageId;
    }

    const initialPages = this.configSitesByLanguage[initialLang] ?? [];
    const pinnedPage = this.findPageByPathOrId(initialPages, this.pinnedInitialPagePath, this.pinnedInitialPageId);

    this.configSitesByLanguage = pinnedPage
      ? {
          [initialLang]: [pinnedPage],
        }
      : {};

    this._siteSubject.next({
      pages: Object.values(this.configSitesByLanguage).flatMap((pages) => (Array.isArray(pages) ? pages : [])),
    });
  }

  public switchLanguageSiteConfig(
    initialLang: AppLang,
    sourceLang: AppLang,
    targetLang: AppLang,
    currentPageId: string | undefined,
    currentPath: string | undefined
  ): Observable<SiteConfigResponse> {
    this.prepareForLanguageSwitch(initialLang, sourceLang, currentPageId, currentPath);
    return this.loadSite([targetLang]);
  }

  public loadSite(langs: AppLang[] | string[]): Observable<SiteConfigResponse> {
    const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso
    const requests = uniqueLangs.map((lang) => this.http.get<SiteConfigResponse>(this.getURlFromLangAndContext(lang)));

    return forkJoin(requests).pipe(
      tap((sites) => {
        const nextConfigSitesByLanguage = { ...this.configSitesByLanguage } as Record<AppLang | string, SitePage[]>;

        uniqueLangs.forEach((lang, idx) => {
          const pages = Array.isArray(sites?.[idx]?.pages) ? sites[idx].pages : [];
          nextConfigSitesByLanguage[lang] = pages;
        });

        this.configSitesByLanguage = nextConfigSitesByLanguage;
      }),
      map(() => ({
        pages: Object.values(this.configSitesByLanguage).flatMap((pages) => (Array.isArray(pages) ? pages : [])),
      })),
      tap((mergedSite) => {
        this._siteSubject.next(mergedSite);
      })
    );
  }

  private getURlFromLangAndContext(lang: AppLang | string): string {
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
    const rows = this.getRows(page);
    for (const row of rows) {
      const cols = this.getCols(row);
      for (const col of cols) {
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

  public getTabNamesByTabsId(
    tabsId: string | number,
    lang?: AppLang
  ): SiteTabSummary[] {
    const tabsIdStr = String(tabsId);
    const pages = lang ? (this.configSitesByLanguage[lang] ?? []) : Object.values(this.configSitesByLanguage).flat();

    const tabMap = new Map<string, SiteTabSummary>();

    for (const page of pages) {
      if (String(page?.tabsId ?? '') === tabsIdStr) {
        this.upsertTabsIntoMap(tabMap, page.tabs);
      }

      const rows = this.getRows(page);
      const cols = rows.flatMap((row) => this.getCols(row));

      for (const col of cols) {
        if (String(col?.tabsId ?? '') !== tabsIdStr) continue;
        this.upsertTabsIntoMap(tabMap, col.tabs);
      }
    }

    return Array.from(tabMap.values());
  }

  private getRows(page: SitePage): SiteLayoutRow[] {
    if (Array.isArray(page?.layout)) {
      return page.layout;
    }
    return Array.isArray(page?.layout?.rows) ? page.layout.rows : [];
  }

  private getCols(row: SiteLayoutRow): SiteLayoutCol[] {
    return Array.isArray(row?.cols) ? row.cols : [];
  }

  private upsertTabsIntoMap(tabMap: Map<string, SiteTabSummary>, tabs: SiteTab[] | undefined): void {
    const safeTabs = Array.isArray(tabs) ? tabs : [];

    safeTabs.forEach((tab) => {
      const name = tab?.name ? String(tab.name) : '';
      if (!name || tabMap.has(name)) return;

      tabMap.set(name, {
        name,
        title: tab?.title ? String(tab.title) : undefined,
        secondaryText: tab?.secondaryText ? String(tab.secondaryText) : undefined,
        tabId: tab?.tabId ? String(tab.tabId) : undefined,
      });
    });
  }

  private findPageByPathOrId(
    pages: SitePage[],
    path: string | null,
    pageId: string | null
  ): SitePage | undefined {
    const normalizedPath = String(path ?? '').trim().replace(/^\//, '');
    const normalizedPageId = String(pageId ?? '').trim();

    return pages.find((page) => {
      const pagePath = String(page?.path ?? '').replace(/^\//, '');
      const pageIdValue = String(page?.pageId ?? '').trim();
      const byPath = normalizedPath && pagePath === normalizedPath;
      const byId = normalizedPageId && pageIdValue === normalizedPageId;
      return Boolean(byPath || byId);
    });
  }
}
