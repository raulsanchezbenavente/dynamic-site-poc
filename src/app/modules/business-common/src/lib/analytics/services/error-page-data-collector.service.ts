/* eslint-disable prettier/prettier */
import { inject, Injectable } from '@angular/core';
import { StorageService } from '@dcx/ui/libs';

import { AnalyticsDataType, AnalyticsEventCategory } from '../../enums';
import { PageErrorAnalyticsEvent } from '../../models';

import { PageViewDataCollector } from './page-view-data-collector.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorPageDataCollector {
  private readonly pageViewCollector = inject(PageViewDataCollector);
  private readonly storageService = inject(StorageService);

  public collect(errorId: string, errorDesc: string, errorPnr?: string): PageErrorAnalyticsEvent['data'] {
    const pageViewData = this.pageViewCollector.collectPageViewData();
    const pnr = errorPnr || this.getPnrFromSession();

    return {
      event_category:  AnalyticsEventCategory.UMBRACO,
      page_location: pageViewData.page_location,
      page_referrer: pageViewData.page_referrer,
      page_title: pageViewData.page_title,
      language: pageViewData.language,
      screen_resolution: pageViewData.screen_resolution,
      user_type: pageViewData.user_type,
      user_id: AnalyticsDataType.NA,
      page_name: this.getPageNameByPathName(pageViewData.page_location),
      error_pnr: pnr,
      error_id: errorId,
      error_desc: errorDesc,
    };
  }

  public collectGlobalError(): PageErrorAnalyticsEvent['data'] {
    return this.collect('404', '404 error');
  }

  public getPageNameByPathName(pathname:string): string {
    const valuesfiltered: string[] = pathname.split("/").filter(value  => !!value);
    return valuesfiltered.at(-1) || AnalyticsDataType.NA;
  }

  private getPnrFromSession(): string {
    const bookingSession = this.storageService.getSessionStorage('sessionBooking');
    return bookingSession?.bookingInfo?.recordLocator || AnalyticsDataType.NA;
  }

}
