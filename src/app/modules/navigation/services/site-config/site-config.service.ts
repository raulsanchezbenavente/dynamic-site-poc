import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AppLang } from './models/langs.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly http = inject(HttpClient);
  private readonly _siteSubject = new BehaviorSubject<any | null>(null);
  public readonly site$ = this._siteSubject.asObservable();
  public configSitesByLanguage: Partial<Record<AppLang, any[]>> = {};

  public keepOnlyLanguages(langs: AppLang[]): void {
    const allowed = new Set<AppLang>(langs);
    const nextConfig: Partial<Record<AppLang, any[]>> = {};

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

  public loadSite(langs: AppLang[] | string[]): Observable<{ pages: any[] }> {
    const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso
    const requests = uniqueLangs.map((lang) => this.http.get<{ pages: any[] }>(this.getURlFromLangAndContext(lang)));

    return forkJoin(requests).pipe(
      tap((sites) => {
        const nextConfigSitesByLanguage = { ...this.configSitesByLanguage } as Record<AppLang | string, any[]>;

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

  public get siteSnapshot(): any | null {
    return this._siteSubject.value;
  }

  public getPagesByLang(lang: AppLang): any[] {
    return this.configSitesByLanguage[lang] ?? [];
  }

  public getBlockConfig(pageId: string, componentName: string, lang: AppLang): any | undefined {
    const pages = this.getPagesByLang(lang);
    const page = pages.find((p) => String(p?.pageId ?? '') === String(pageId));
    if (!page) {
      return undefined;
    }
    const rows = page?.layout?.rows ?? (Array.isArray(page?.layout) ? page.layout : []);
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

  public getTabNamesByTabsId(
    tabsId: string | number,
    lang?: AppLang
  ): Array<{ name: string; title?: string; secondaryText?: string; tabId?: string }> {
    const tabsIdStr = String(tabsId);
    const pages = lang ? (this.configSitesByLanguage[lang] ?? []) : Object.values(this.configSitesByLanguage).flat();

    const tabMap = new Map<string, { name: string; title?: string; secondaryText?: string; tabId?: string }>();

    for (const page of pages) {
      if (String(page?.tabsId ?? '') === tabsIdStr) {
        const pageTabs = Array.isArray(page?.tabs) ? page.tabs : [];
        pageTabs.forEach((tab: any) => {
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

      const rows = page?.layout?.rows ?? page?.layout ?? [];
      const cols = Array.isArray(rows) ? rows.flatMap((row: any) => row?.cols ?? []) : [];

      for (const col of cols) {
        if (String(col?.tabsId ?? '') !== tabsIdStr) continue;
        const tabs = Array.isArray(col?.tabs) ? col.tabs : [];
        tabs.forEach((tab: any) => {
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
}
