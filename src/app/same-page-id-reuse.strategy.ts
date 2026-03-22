import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class SamePageIdReuseStrategy implements RouteReuseStrategy {
  public shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  public store(_route: ActivatedRouteSnapshot, _handle: DetachedRouteHandle | null): void {
    // Intentionally empty: we only customize shouldReuseRoute behavior.
  }

  public shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  public retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const futurePageId = String(future.data?.['pageId'] ?? '');
    const currPageId = String(curr.data?.['pageId'] ?? '');

    if (futurePageId && currPageId && futurePageId === currPageId) {
      return true;
    }

    return future.routeConfig === curr.routeConfig;
  }
}
