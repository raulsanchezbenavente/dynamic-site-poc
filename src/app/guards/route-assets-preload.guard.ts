import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

import { preloadLayoutComponents } from '../component-map';

@Injectable({ providedIn: 'root' })
export class RouteAssetsPreloadGuard implements CanActivate {
  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    await Promise.allSettled([
      import('../dynamic-composite/dynamic-page/dynamic-page.component'),
      preloadLayoutComponents(route.data?.['components']),
    ]);

    return true;
  }
}
