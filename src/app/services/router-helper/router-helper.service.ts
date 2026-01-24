import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tabsId: Record<string, string> = {};

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

  public setCurrentTabId(tabsId: string, tabId: string): void {
    this.tabsId[tabsId] = tabId;
  }

  public getCurrentTabId(tabsId: string): string | undefined {
    return this.tabsId ? this.tabsId[tabsId] : undefined;
  }

}
