import { Injectable } from '@angular/core';
import { AnalyticsEventCategory } from '@dcx/ui/business-common';
import { RegexEventCategory } from '../enums/event-category-regex.enum';

@Injectable({ providedIn: 'root' })
export class BaseItemsMapper {
  public getPageNameByPathName(pathname: string): string {
    let valuesfiltered: string[] = pathname.split('/').filter((value) => !!value);
    return valuesfiltered.at(-1) || '';
  }

  public getEventCategory(url: string): AnalyticsEventCategory {
    switch (true) {
      case new RegExp(RegexEventCategory.BOOKING).test(url):
        return AnalyticsEventCategory.BOOKING;
      case new RegExp(RegexEventCategory.CHECK_IN).test(url):
        return AnalyticsEventCategory.CHECK_IN;
      default:
        return AnalyticsEventCategory.UMBRACO;
    }
  }
}
