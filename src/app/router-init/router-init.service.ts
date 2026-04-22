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
import { catchError, filter, forkJoin, fromEvent, map, Observable, of, shareReplay, switchMap, take, tap } from 'rxjs';

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

      this.router.resetConfig([
        { path: '', redirectTo: 'en/members/home', pathMatch: 'full' },
        ...routes,
        { path: '**', redirectTo: 'en/members/home' },
      ]);

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
    const rows = this.getLayoutRows(page.layout);
    const shouldIncludeSlots = typeof page.layout === 'string';
    const allRows = shouldIncludeSlots ? [...rows, ...this.getSlotsRows(page.slots)] : rows;

    return this.buildTabNamesByRows(allRows);
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
    return this.resolveRowsFromLayout(page.layout).pipe(
      switchMap((layoutRows) =>
        this.resolveSlotsRows(page.slots).pipe(
          map((slotsRowsByName) => this.mergeLayoutRowsWithSlots(layoutRows, slotsRowsByName))
        )
      ),
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

  private resolveSlotsRows(slots: SitePage['slots'] | undefined): Observable<Record<string, SiteLayoutRow[]>> {
    const slotEntries = Object.entries(slots ?? {})
      .map(([slotName, slotLayout]) => [slotName.trim(), slotLayout] as const)
      .filter(([slotName]) => Boolean(slotName));

    if (!slotEntries.length) {
      return of({});
    }

    const slotRequests = slotEntries.map(([slotName, slotLayout]) =>
      this.resolveRowsFromLayout(slotLayout).pipe(map((rows) => [slotName, rows] as const))
    );

    return forkJoin(slotRequests).pipe(
      map((resolvedSlotEntries) => Object.fromEntries(resolvedSlotEntries) as Record<string, SiteLayoutRow[]>)
    );
  }

  private mergeLayoutRowsWithSlots(
    layoutRows: SiteLayoutRow[],
    slotsRowsByName: Record<string, SiteLayoutRow[]>
  ): SiteLayoutRow[] {
    return layoutRows.flatMap((row) => {
      const slotName = this.getSlotNameFromRow(row);
      if (!slotName) {
        return [row];
      }

      if (!Object.prototype.hasOwnProperty.call(slotsRowsByName, slotName)) {
        console.warn('[RouterInitService] Slot is not defined in page.slots and will be skipped.', { slotName });
        return [];
      }

      return slotsRowsByName[slotName] ?? [];
    });
  }

  private getSlotsRows(slots: SitePage['slots'] | undefined): SiteLayoutRow[] {
    return Object.values(slots ?? {}).flatMap((slotLayout) => this.getLayoutRows(slotLayout));
  }

  private getSlotNameFromRow(row: SiteLayoutRow): string {
    return String(row?.slot ?? '').trim();
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
