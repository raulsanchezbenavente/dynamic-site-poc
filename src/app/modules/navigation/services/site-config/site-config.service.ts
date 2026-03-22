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
  private pinnedRouteLang: AppLang | null = null;
  private pinnedRoutePageId: string | null = null;
  private pinnedRoutePath: string | null = null;

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

  public switchLanguageSiteConfig(
    sourceLang: AppLang,
    targetLang: AppLang,
    currentPageId: string | undefined,
    currentPath: string | undefined
  ): Observable<SiteConfigResponse> {
    this.prepareLanguageSwitch(sourceLang, currentPageId, currentPath);
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

  private prepareLanguageSwitch(sourceLang: AppLang, currentPageId: string | undefined, currentPath: string | undefined): void {
    const normalizedPath = String(currentPath ?? '').trim().replace(/^\//, '') || null;
    const normalizedPageId = String(currentPageId ?? '').trim() || null;

    const sourcePages = this.configSitesByLanguage[sourceLang] ?? [];
    const currentSourcePage = this.findPageByPathOrId(sourcePages, normalizedPageId, normalizedPath);

    const shouldUpdatePinnedRoute =
      !!currentSourcePage &&
      (!this.pinnedRoutePageId || !normalizedPageId || normalizedPageId !== this.pinnedRoutePageId);

    if (shouldUpdatePinnedRoute) {
      this.pinnedRouteLang = sourceLang;
      this.pinnedRoutePageId = normalizedPageId;
      this.pinnedRoutePath = normalizedPath;
    }

    const pinnedPages = this.pinnedRouteLang ? (this.configSitesByLanguage[this.pinnedRouteLang] ?? []) : [];
    const pinnedPage = this.findPageByPathOrId(pinnedPages, this.pinnedRoutePageId, this.pinnedRoutePath);

    this.configSitesByLanguage = pinnedPage && this.pinnedRouteLang
      ? {
          [this.pinnedRouteLang]: [pinnedPage],
        }
      : {};

    this._siteSubject.next({
      pages: Object.values(this.configSitesByLanguage).flatMap((pages) => (Array.isArray(pages) ? pages : [])),
    });
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

  private findPageByPathOrId(pages: SitePage[], pageId: string | null, path: string | null): SitePage | undefined {
    const normalizedPageId = String(pageId ?? '').trim();
    const normalizedPath = String(path ?? '').trim().replace(/^\//, '');

    return pages.find((page) => {
      const pageIdValue = String(page?.pageId ?? '').trim();
      const pagePathValue = String(page?.path ?? '').trim().replace(/^\//, '');
      const byPageId = normalizedPageId && pageIdValue === normalizedPageId;
      const byPath = normalizedPath && pagePathValue === normalizedPath;
      return Boolean(byPageId || byPath);
    });
  }
}
