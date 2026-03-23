import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
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

  public loadSite(langs: AppLang[] | string[]): Observable<SiteConfigResponse> {
    const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso
    const missingLangs = uniqueLangs.filter((lang) => {
      const appLang = lang as AppLang;
      return !this.configSitesByLanguage[appLang]?.length;
    });

    if (!missingLangs.length) {
      return of(this.getMergedSiteConfig());
    }

    const requests = missingLangs.map((lang) => this.http.get<SiteConfigResponse>(this.getURlFromLangAndContext(lang)));

    return forkJoin(requests).pipe(
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
      }),
      map(() => this.getMergedSiteConfig()),
      tap((mergedSite) => {
        this._siteSubject.next(mergedSite);
      })
    );
  }

  private getMergedSiteConfig(): SiteConfigResponse {
    const mergedPages: SitePage[] = Object.values(this.configSitesByLanguage).flatMap((pages) => pages ?? []);
    return { pages: mergedPages };
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
    const rows: SiteLayoutRow[] = Array.isArray(page.layout) ? page.layout : (page.layout?.rows ?? []);
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
    const tabsId = page?.tabsId;

    return tabsId === undefined || tabsId === null ? undefined : String(tabsId);
  }

  public getTabNamesByTabsId(tabsId: string | number, lang?: AppLang): SiteTabSummary[] {
    const tabsIdStr = String(tabsId);
    const pages = lang ? (this.configSitesByLanguage[lang] ?? []) : Object.values(this.configSitesByLanguage).flat();

    const tabMap = new Map<string, SiteTabSummary>();

    for (const page of pages) {
      if (String(page?.tabsId ?? '') === tabsIdStr) {
        const pageTabs = Array.isArray(page?.tabs) ? page.tabs : [];
        pageTabs.forEach((tab: SiteTab) => {
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

      const rows: SiteLayoutRow[] = Array.isArray(page.layout) ? page.layout : (page.layout?.rows ?? []);
      const cols: SiteLayoutCol[] = Array.isArray(rows) ? rows.flatMap((row: SiteLayoutRow) => row?.cols ?? []) : [];

      for (const col of cols) {
        if (String(col?.tabsId ?? '') !== tabsIdStr) continue;
        const tabs = Array.isArray(col?.tabs) ? col.tabs : [];
        tabs.forEach((tab: SiteTab) => {
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

  public removeLanguage(lang: AppLang): void {
    if (!this.configSitesByLanguage[lang]) {
      return;
    }

    delete this.configSitesByLanguage[lang];
    this._siteSubject.next(this.getMergedSiteConfig());
  }
}
