import { inject, Injectable, OnDestroy } from '@angular/core';
import { AnalyticsService } from '@dcx/module/analytics';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageViewStrategyService implements OnDestroy {
  private enableAnalyticsPageView = false;
  private readonly analyticsService = inject(AnalyticsService);
  private readonly unsubscribe$ = new Subject<void>();
  private readonly pageViewSubject = new Subject<void>();
  public readonly pageView$ = this.pageViewSubject.asObservable();

  public enablePageView(shouldInitialize: boolean): void {
    this.enableAnalyticsPageView = shouldInitialize;
    if (this.enableAnalyticsPageView) {
      console.debug('Custom page_view strategy is enabled.');
      this.initializePageViewStrategy();
    } else {
      console.debug('Custom page_view strategy is disabled.');
    }
  }

  private initializePageViewStrategy(): void {
    if (performance?.getEntriesByType) {
      const entries = performance.getEntriesByType('navigation');
      if (entries && entries.length > 0) {
        const nav: PerformanceNavigationTiming = entries[0] as PerformanceNavigationTiming;
        switch (nav.type) {
          case 'back_forward':
          case 'reload':
          default:
            this.pageViewSubject.next();
            break;
        }
      }
    }
  }

  public sendPageViewEvent(typeEvent: string, data: Record<string, unknown>): void {
    this.analyticsService.trackEvent({ eventName: typeEvent, data });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
