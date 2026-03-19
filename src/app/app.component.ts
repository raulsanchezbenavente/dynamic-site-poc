import { Component, inject, Type } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';

import { environment } from '../environments/environment';

import { ProgressAsynGuard } from './guards/progress-async.guard';
import { RouteAssetsPreloadGuard } from './guards/route-assets-preload.guard';
import { SiteConfigService } from './services/site-config/site-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
export class AppComponent {
  private router = inject(Router);
  private siteSvc = inject(SiteConfigService);
  private readonly bootLoaderMinDurationMs = environment.bootLoaderMinDurationMs;

  constructor() {
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

    this.siteSvc.site$.pipe().subscribe((site) => {
      const pages = site?.pages ?? [];

      const routes = pages.map((page: any, index: number) => ({
        path: page.path,
        loadComponent: (): Promise<Type<unknown>> =>
          import('./dynamic-composite/dynamic-page/dynamic-page.component').then((m) => m.DynamicPageComponent),
        data: {
          path: page.path,
          components: page.layout?.rows ?? page.layout,
          pageId: page.pageId,
          pageName: page.name,
          tabsId: page.tabId ?? null,
          tabNamesById: (
            page.layout?.rows?.flatMap((row: any) => row.cols?.flatMap((col: any) => col.tabs || []) || []) || []
          ).reduce((acc: Record<string, string>, tab: any) => {
            if (tab && tab.pageId) acc[tab.pageId] = tab.name ?? '';
            return acc;
          }, {}),
        },
        canActivate: index > 0 ? [ProgressAsynGuard, RouteAssetsPreloadGuard] : [RouteAssetsPreloadGuard],
      }));

      this.router.resetConfig([...routes, { path: '**', redirectTo: 'en/home' }]);
    });
  }
}
