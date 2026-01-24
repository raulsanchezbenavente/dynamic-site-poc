import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tabId: string | null = null;

  private getLeafRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }

  public getCurrentPageId(): string | undefined {
    const leaf = this.getLeafRoute(this.route);
    return leaf.snapshot.data?.['pageId'];
  }

  public findRouteByPageId(pageId: string): Route | undefined {
    return this.router.config.find(
      r => r.data?.['pageId'] === pageId
    );
  }

  public setCurrentTabId(tabId: string): void {
    this.tabId = tabId;
    // const leaf = this.getLeafRoute(this.route);

    // this.router.navigate([], {
    //   relativeTo: leaf,
    //   queryParams: { activeTab: tabId },
    //   queryParamsHandling: 'merge',
    //   replaceUrl: true,
    // });
  }

  public getCurrentTabId(): string | undefined {
    return this.tabId ?? undefined;
  }

}
