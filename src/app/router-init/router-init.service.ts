import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Type } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Route, Router } from '@angular/router';
import {
  LanguageSwitchService,
  ProgressAsynGuard,
  SiteConfigService,
  SiteLayout,
  SiteLayoutRow,
  SitePage,
} from '@navigation';
import { catchError, combineLatest, filter, fromEvent, map, Observable, of, shareReplay, take, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { RouteAssetsPreloadGuard } from '../guards/route-assets-preload.guard';
import { TabConfigEntry } from '../modules/dynamic-composite/dynamic-tabs/models/tab-config.model';

@Injectable({ providedIn: 'root' })
export class RouterInitService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly languageSwitchService = inject(LanguageSwitchService);
  private readonly bootLoaderMinDurationMs = environment.bootLoaderMinDurationMs;
  private readonly layoutRowsCache = new Map<string, Observable<SiteLayoutRow[]>>();

  private hasLoggedInitialSiteLoad = false;
  private shouldSyncLangFromUrl = false;
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.logDirectBrowserEntry();
    this.trackBrowserNavigationTrigger();
    this.syncLanguageOnNavigationEnd();
    this.resetRoutesFromSiteConfig();
    this.syncLanguageOnPopState();
  }

  private removeBootLoaderAfterFirstNavigation(): void {
    const bootStartedAt = Date.now();

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError
        ),
        take(1)
      )
      .subscribe(() => {
        const elapsed = Date.now() - bootStartedAt;
        const waitMs = Math.max(0, this.bootLoaderMinDurationMs - elapsed);

        globalThis.setTimeout(() => {
          globalThis.document?.getElementById('boot-loader')?.remove();
        }, waitMs);
      });
  }

  private trackBrowserNavigationTrigger(): void {
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        this.shouldSyncLangFromUrl = event.navigationTrigger === 'popstate';
      });
  }

  private syncLanguageOnNavigationEnd(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const langFromUrl = this.languageSwitchService.getLangFromPath(event.urlAfterRedirects);
        const visitedPath = event.urlAfterRedirects.split('?')[0].split('#')[0] ?? '';
        this.siteConfigService.markRouteAsVisited(langFromUrl, visitedPath);

        if (!this.shouldSyncLangFromUrl) {
          return;
        }

        this.languageSwitchService.syncLanguageFromPath(event.urlAfterRedirects);
        this.shouldSyncLangFromUrl = false;
      });
  }

  private resetRoutesFromSiteConfig(): void {
    this.siteConfigService.site$.subscribe((site) => {
      const pages = site?.pages ?? [];
      const routes = pages.map((page, index) => this.buildPageRoute(page, index));

      this.router.resetConfig([...routes, { path: '**', redirectTo: 'en/home' }]);

      if (!this.hasLoggedInitialSiteLoad) {
        this.hasLoggedInitialSiteLoad = true;
        console.log('[SITE LOAD][INIT] router.config', this.router.config);
        console.log('[SITE LOAD][INIT] site config', this.siteConfigService.siteSnapshot);
      }
    });
  }

  private syncLanguageOnPopState(): void {
    fromEvent(globalThis, 'popstate').subscribe(() => {
      this.languageSwitchService.syncLanguageFromPath(`${globalThis.location.pathname}${globalThis.location.search}`);
    });
  }

  private buildPageRoute(page: SitePage, index: number): Route {
    return {
      path: page.path,
      loadComponent: (): Promise<Type<unknown>> =>
        import('../modules/dynamic-composite/dynamic-page/dynamic-page.component').then(
          (module) => module.DynamicPageComponent
        ),
      data: {
        path: page.path,
        components: this.getPageComponents(page),
        pageId: page.pageId,
        pageName: page.name,
        seo: page.seo,
        tabNamesById: this.buildTabNamesById(page),
      },
      resolve: {
        components: () => this.resolvePageComponents(page),
        tabNamesById: () => this.resolveTabNamesById(page),
      },
      canActivate: index > 0 ? [ProgressAsynGuard, RouteAssetsPreloadGuard] : [RouteAssetsPreloadGuard],
    };
  }

  private resolvePageComponents(page: SitePage): Observable<SiteLayoutRow[]> {
    return this.resolveLayoutRows(page);
  }

  private resolveTabNamesById(page: SitePage): Observable<Record<string, string>> {
    return this.resolveLayoutRows(page).pipe(map((rows) => this.buildTabNamesByRows(rows)));
  }

  private getPageComponents(page: SitePage): SiteLayoutRow[] {
    const { layout } = page;

    if (Array.isArray(layout)) {
      return layout;
    }

    return this.getLayoutRows(layout);
  }

  private buildTabNamesById(page: SitePage): Record<string, string> {
    return this.buildTabNamesByRows(this.getLayoutRows(page.layout));
  }

  private buildTabNamesByRows(rows: SiteLayoutRow[]): Record<string, string> {
    return rows
      .flatMap((row) => row.cols ?? [])
      .flatMap((col) => (col.config?.['tabs'] as TabConfigEntry[] | undefined) ?? [])
      .reduce((accumulator: Record<string, string>, tab: TabConfigEntry) => {
        if (tab.pageId) {
          accumulator[tab.pageId] = tab.name ?? '';
        }

        return accumulator;
      }, {});
  }

  private resolveLayoutRows(page: SitePage): Observable<SiteLayoutRow[]> {
    const layout = page.layout;
    const template = page.template;

    const pageRows$ = this.resolveRowsFromLayout(layout).pipe(
      tap((rows) => this.siteConfigService.hydrateResolvedPageLayout(page.path, rows))
    );

    if (typeof template !== 'string') {
      return pageRows$;
    }

    const templateUrl = template.trim();
    if (!templateUrl) {
      return pageRows$;
    }

    const templateRows$ = this.resolveRowsFromUrl(templateUrl);

    return combineLatest([templateRows$, pageRows$]).pipe(
      map(([templateRows, pageRows]) => this.mergeTemplateRowsWithPageRows(templateRows, pageRows)),
      tap((rows) => this.siteConfigService.hydrateResolvedPageLayout(page.path, rows))
    );
  }

  private resolveRowsFromLayout(
    layout: SiteLayout | SiteLayoutRow[] | string | undefined
  ): Observable<SiteLayoutRow[]> {
    if (typeof layout !== 'string') {
      return of(this.getLayoutRows(layout));
    }

    const layoutUrl = layout.trim();
    if (!layoutUrl) {
      return of([]);
    }

    return this.resolveRowsFromUrl(layoutUrl);
  }

  private resolveRowsFromUrl(url: string): Observable<SiteLayoutRow[]> {
    const cachedRequest = this.layoutRowsCache.get(url);
    if (cachedRequest) {
      return cachedRequest;
    }

    const request$ = this.http.get<SiteLayout | SiteLayoutRow[]>(url).pipe(
      map((layoutResponse) => this.getLayoutRows(layoutResponse)),
      catchError((error) => {
        console.warn('[RouterInitService] Failed to resolve layout URL', { url, error });
        return of([]);
      }),
      shareReplay(1)
    );

    this.layoutRowsCache.set(url, request$);
    return request$;
  }

  private mergeTemplateRowsWithPageRows(templateRows: SiteLayoutRow[], pageRows: SiteLayoutRow[]): SiteLayoutRow[] {
    const hasContentSlot = templateRows.some((row) => row.contentSlot === true);

    if (!hasContentSlot) {
      console.warn('[RouterInitService] Template does not include contentSlot=true. Falling back to page layout rows.');
      return pageRows;
    }

    return templateRows.flatMap((row) => (row.contentSlot === true ? pageRows : [row]));
  }

  private getLayoutRows(layout: SiteLayout | SiteLayoutRow[] | string | undefined): SiteLayoutRow[] {
    if (Array.isArray(layout)) {
      return layout;
    }

    if (typeof layout === 'string') {
      return [];
    }

    return layout?.rows ?? [];
  }

  private logDirectBrowserEntry(): void {
    const navigationEntry = globalThis.performance?.getEntriesByType?.('navigation')?.at(0) as
      | PerformanceNavigationTiming
      | undefined;
    const navigationType = navigationEntry?.type;

    if (navigationType === 'navigate' || navigationType === 'reload') {
      console.log('[APP ENTRY][BROWSER]', {
        type: navigationType,
        url: `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`,
      });
    }
  }
}
