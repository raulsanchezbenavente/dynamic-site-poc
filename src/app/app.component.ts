import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';

import { ProgressAsynGuard } from './guards/progress-async.guard';
import { DynamicPageComponent } from './dynamic-composite/dynamic-page/dynamic-page.component';
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

  constructor() {
    this.siteSvc.site$.pipe(take(1)).subscribe((site) => {
      const pages = site?.pages ?? [];

      const routes = pages.map((page: any, index: number) => ({
        path: page.path,
        component: DynamicPageComponent,
        data: { components: page.layout?.rows ?? page.layout },
        ...(index > 0 && { canActivate: [ProgressAsynGuard] }),
      }));

      this.router.resetConfig([
        ...routes,
        { path: '**', redirectTo: 'avianca-home' },
      ]);
    });
  }
}
