import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { PageNavigationService } from '../page-navigation/page-navigation.service';
import { RouterHelperService } from '../router-helper/router-helper.service';
import { APP_LANGS, AppLang } from '../site-config/models/langs.model';
import { SiteConfigService } from '../site-config/site-config.service';

/**
 * Centralizes language switching logic including:
 * - Marking current routes as visited
 * - Loading new language configuration
 * - Resolving and navigating to the appropriate page in new language
 * - Pruning unvisited routes from previous language
 * - Updating all related services
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageSwitchService {
  private readonly siteConfig = inject(SiteConfigService);
  private readonly pageNavigation = inject(PageNavigationService);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  public syncLanguageFromPath(path: string): void {
    const langFromUrl = this.getLangFromPath(path);
    if (this.routerHelper.language === langFromUrl && this.translate.currentLang === langFromUrl) {
      return;
    }

    this.siteConfig
      .loadSite([langFromUrl])
      .pipe(take(1))
      .subscribe(() => {
        if (this.translate.currentLang !== langFromUrl) {
          this.translate
            .use(langFromUrl)
            .pipe(take(1))
            .subscribe({
              next: () => {
                if (this.routerHelper.language !== langFromUrl) {
                  this.routerHelper.changeLanguage(langFromUrl);
                }
              },
              error: () => {
                if (this.routerHelper.language !== langFromUrl) {
                  this.routerHelper.changeLanguage(langFromUrl);
                }
              },
            });
          return;
        }

        if (this.routerHelper.language !== langFromUrl) {
          this.routerHelper.changeLanguage(langFromUrl);
        }
      });
  }

  public getLangFromPath(path: string): AppLang {
    const segment = path.split('?')[0].split('/').filter(Boolean)[0];
    return APP_LANGS.includes(segment as AppLang) ? (segment as AppLang) : 'en';
  }

  /**
   * Switches to a new language with intelligent routing and route cleanup
   *
   * Flow:
   * 1. Marks current route as visited
   * 2. Loads new language configuration
   * 3. Waits for router to be updated (next microtask)
   * 4. Resolves target page path in new language
   * 5. Navigates to that path preserving query params and active tabs
   * 6. On successful navigation, prunes non-visited routes from previous language
   * 7. Updates language in all related services
   *
   * @param targetLang - The language to switch to
   * @returns Observable that completes after successful language switch
   */
  public switchLanguage(targetLang: AppLang): Observable<void> {
    const currentLang = this.routerHelper.language;

    // Bail out if already in target language
    if (currentLang === targetLang) {
      return new Observable((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }

    // Mark current route as visited before switching
    this.siteConfig.markRouteAsVisited(currentLang, globalThis.location.pathname);

    return this.siteConfig.loadSite([targetLang]).pipe(
      take(1),
      // Wait for next microtask to ensure AppComponent has updated router.resetConfig()
      switchMap(() => from(Promise.resolve())),
      tap(() => {
        this._executeLanguageSwitch(currentLang, targetLang);
      }),
      map(() => undefined)
    );
  }

  /**
   * Executes the navigation and language update after new config is loaded
   * Handles two scenarios: with current page context or without
   */
  private _executeLanguageSwitch(currentLang: AppLang, targetLang: AppLang): void {
    const pageId = this.routerHelper.getCurrentPageId();

    if (pageId) {
      this._navigateToPageInNewLanguage(pageId, currentLang, targetLang);
    } else {
      this.ensureTranslationLanguage(targetLang).subscribe(() => {
        this._updateLanguageState(currentLang, targetLang);
      });
    }
  }

  /**
   * Navigates to the current page in the target language
   * Preserves active tab query parameter if applicable
   */
  private _navigateToPageInNewLanguage(pageId: string, currentLang: AppLang, targetLang: AppLang): void {
    const nextPath = this.pageNavigation.resolvePagePath(pageId, targetLang);

    if (!nextPath) {
      // Fallback: just update language without navigation
      this._updateLanguageState(currentLang, targetLang);
      return;
    }

    const query = this._buildLanguageSwitchQuery(pageId, currentLang, targetLang);
    const targetUrl = query ? `${nextPath}?${query}` : nextPath;

    this.ensureTranslationLanguage(targetLang).subscribe(() => {
      void this.router
        .navigateByUrl(targetUrl)
        .then((navigated) => {
          if (!navigated) {
            console.warn('[LANG SWITCH] Navigation canceled, preserving current language routes', {
              currentLang,
              targetLang,
              targetUrl,
            });
            return;
          }

          this._updateLanguageState(currentLang, targetLang);
          this._pruneAndLogRoutes(currentLang);
        })
        .catch((error) => {
          console.error('[LANG SWITCH] Navigation failed, preserving current language routes', error);
        });
    });
  }

  /**
   * Updates language state across all related services
   */
  private _updateLanguageState(currentLang: AppLang, targetLang: AppLang): void {
    this.routerHelper.changeLanguage(targetLang);
  }

  private ensureTranslationLanguage(targetLang: AppLang): Observable<void> {
    if (this.translate.currentLang === targetLang) {
      return of(undefined);
    }

    return this.translate.use(targetLang).pipe(
      take(1),
      map(() => undefined),
      catchError(() => of(undefined))
    );
  }

  /**
   * Prunes non-visited routes from the previous language and logs final state
   */
  private _pruneAndLogRoutes(previousLang: AppLang): void {
    this.siteConfig.pruneLanguageKeepingVisitedRoutes(previousLang);
    this._logRouteState();
  }

  /**
   * Builds query string for language switch, preserving activeTab parameter
   * Handles tab name translation between languages if needed
   */
  private _buildLanguageSwitchQuery(pageId: string, currentLang: AppLang, nextLang: AppLang): string {
    const params = new URLSearchParams(globalThis.location.search);
    const activeTab = params.get('activeTab') ?? undefined;

    if (!activeTab) {
      return params.toString();
    }

    const tabsId = this.siteConfig.getTabsIdByPageId(pageId, currentLang);
    if (!tabsId) {
      return params.toString();
    }

    const currentTabSummaries = this.siteConfig.getTabNamesByTabsId(tabsId, currentLang);
    const targetTabSummaries = this.siteConfig.getTabNamesByTabsId(tabsId, nextLang);
    const normalizedActiveTab = activeTab.trim().toLowerCase();
    const currentTabId = currentTabSummaries.find(
      (summary) => summary.name.trim().toLowerCase() === normalizedActiveTab
    )?.tabId;

    if (!currentTabId) {
      return params.toString();
    }

    const targetTabName = targetTabSummaries.find((summary) => summary.tabId === currentTabId)?.name;
    if (!targetTabName) {
      return params.toString();
    }

    params.set('activeTab', targetTabName);
    return params.toString();
  }

  /**
   * Logs current router and site config state for debugging
   */
  private _logRouteState(): void {
    console.log('[LANG SWITCH COMPLETE] router.config', this.router.config);
    console.log('[LANG SWITCH COMPLETE] site config', this.siteConfig.siteSnapshot);
  }
}
