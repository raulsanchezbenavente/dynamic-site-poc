import { inject, Injectable } from '@angular/core';
import { AnalyticsService } from '@dcx/module/analytics';
import { AnalyticsEventType, ErrorPageDataCollector } from '@dcx/ui/business-common';

import { PageErrorEnum } from '../enums/page-error.enum';

@Injectable({
  providedIn: 'root',
})
export class Page404TrackerService {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly errorPageDataCollector = inject(ErrorPageDataCollector);

  public initialize(): void {
    this.checkFor404();
  }

  private checkFor404(): void {
    if (document.querySelector('[error-page-attribute]')) {
      const eventData = this.errorPageDataCollector.collect(PageErrorEnum.ERROR_CODE, PageErrorEnum.ERROR_DESCRIPTION);

      this.analyticsService.trackEvent({
        eventName: AnalyticsEventType.PAGE_ERROR,
        data: eventData,
      });
    }
  }
}
