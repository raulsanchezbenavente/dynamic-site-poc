import { inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PageViewStrategyService } from '@dcx/module/analytics';
import { AccountStateService, AnalyticsEventType, PageViewDataCollector } from '@dcx/ui/business-common';
import { PointOfSaleService } from '@dcx/ui/libs';
import { combineLatest, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageViewInitializerService {
  private readonly analyticsPageViewStrategyService = inject(PageViewStrategyService);
  private readonly pageViewCollectorService = inject(PageViewDataCollector);
  private readonly accountStateService = inject(AccountStateService);
  private readonly pointOfSaleService = inject(PointOfSaleService);

  private readonly DATA_TIMEOUT_FALLBACK = 10000;
  private readonly accountDto$ = toObservable(this.accountStateService.accountDto);

  private pageViewSent: boolean = false;

  public initialize(): void {
    this.pageLoadStrategy();
    this.analyticsPageViewStrategyService.enablePageView(true);
  }

  private pageLoadStrategy(): void {
    this.analyticsPageViewStrategyService.pageView$.subscribe(() => {
      const sendPageViewRef: ReturnType<typeof setTimeout> = setTimeout(() => {
        this.sendPageViewEvent(sendPageViewRef);
      }, this.DATA_TIMEOUT_FALLBACK);

      const account = this.accountStateService.getAccountData();
      const pos = this.pointOfSaleService.getCurrentPointOfSale()?.stationCode;
      if (account && pos) {
        // BF Cache scenario
        this.sendPageViewEvent(sendPageViewRef);
      } else if (account) {
        this.pointOfSaleService.pointOfSale$.pipe(take(1)).subscribe(() => {
          this.sendPageViewEvent(sendPageViewRef);
        });
      } else if (pos) {
        this.accountDto$.pipe(take(1)).subscribe(() => {
          this.sendPageViewEvent(sendPageViewRef);
        });
      } else {
        combineLatest([this.pointOfSaleService.pointOfSale$, this.accountDto$])
          .pipe(take(1))
          .subscribe(() => {
            this.sendPageViewEvent(sendPageViewRef);
          });
      }
    });
  }

  private sendPageViewEvent(sendPageViewRef: ReturnType<typeof setTimeout>): void {
    clearTimeout(sendPageViewRef);
    if (this.pageViewSent) {
      return;
    }
    this.pageViewSent = true;
    this.analyticsPageViewStrategyService.sendPageViewEvent(
      AnalyticsEventType.PAGE_VIEW,
      this.pageViewCollectorService.collectPageViewData()
    );
  }
}
