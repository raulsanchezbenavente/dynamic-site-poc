import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppLang } from '../site-config/models/langs.model';

@Injectable({
  providedIn: 'root',
})
export class RouterHelperService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private tabsId: Record<string, string> = {};
  private readonly languageChangeSubject = new Subject<AppLang>();
  public readonly languageChange$ = this.languageChangeSubject.asObservable();

  private readonly activeTabSubject = new Subject<string>();
  public readonly activeTab$ = this.activeTabSubject.asObservable();

  private _language: AppLang = 'en';
  public get language(): AppLang {
    return this._language;
  }

  public set language(lang: AppLang) {
    this._language = lang;
  }

  constructor() {
    const segment = globalThis.location.pathname.split('/').find(Boolean);
    const lang = segment === 'en' || segment === 'es' || segment === 'fr' || segment === 'pt' ? segment : 'en';
    this._language = lang;
  }

  public getLeafRoute(): ActivatedRoute {
    let current = this.route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }

  public getCurrentPageId(): string | undefined {
    const leaf = this.getLeafRoute();
    return leaf.snapshot.data?.['pageId'];
  }

  public findRouteByPageId(pageId: string): Route | undefined {
    return this.router.config.find((r) => r.data?.['pageId'] === pageId);
  }

  public setCurrentTabId(tabsId: string, tabId: string): void {
    this.tabsId[tabsId] = tabId;
  }

  public getCurrentTabId(tabsId: string): string | undefined {
    return this.tabsId ? this.tabsId[tabsId] : undefined;
  }

  public changeLanguage(lang: AppLang): void {
    this._language = lang;
    this.languageChangeSubject.next(lang);
  }

  public syncActiveTabUrl(tabName: string | undefined, historyMode: 'push' | 'replace' = 'replace'): void {
    const url = new URL(globalThis.location.href);
    const params = new URLSearchParams(url.search);
    params.set('activeTab', tabName ?? '');

    const normalizedQuery = Array.from(params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const query = normalizedQuery ? `?${normalizedQuery}` : '';
    const nextUrl = `${url.pathname}${query}${url.hash}`;
    const currentUrl = `${url.pathname}${url.search}${url.hash}`;

    if (nextUrl === currentUrl) {
      return;
    }

    if (historyMode === 'push') {
      globalThis.history.pushState({}, '', nextUrl);
      return;
    }

    globalThis.history.replaceState({}, '', nextUrl);
  }

  public changeActiveTab(tabId: string): void {
    this.activeTabSubject.next(tabId);
  }
}
