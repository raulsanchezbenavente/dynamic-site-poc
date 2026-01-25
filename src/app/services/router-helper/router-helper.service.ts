import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppLang } from '../site-config/models/langs.model';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tabsId: Record<string, string> = {};
  private readonly languageChangeSubject = new Subject<AppLang>();
  public readonly languageChange$ = this.languageChangeSubject.asObservable();
  private _language: AppLang = 'en';
  public get language(): AppLang {
    return this._language;
  }
  public set language(lang: AppLang) {
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
    return this.router.config.find(
      r => r.data?.['pageId'] === pageId
    );
  }

  public setCurrentTabId(tabsId: string, tabId: string): void {
    this.tabsId[tabsId] = tabId;
  }

  public getCurrentTabId(tabsId: string): string | undefined {
    return this.tabsId ? this.tabsId[tabsId] : undefined;
  }

  public changeLanguage(lang: AppLang): void {
    this.languageChangeSubject.next(lang);
  }

}
