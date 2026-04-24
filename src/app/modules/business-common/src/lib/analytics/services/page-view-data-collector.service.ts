import { inject, Injectable } from '@angular/core';
import { BookingModels } from '@dcx/module/api-clients';
import { CultureServiceEx, PointOfSaleService, StorageService } from '@dcx/ui/libs';
import dayjs from 'dayjs';

import { AnalyticsDataType, AnalyticsUserType } from '../../enums';
import { PageViewAnalyticsEvent } from '../../models';
import { AccountStateService } from '../../services/account-state/account-state.service';

@Injectable({
  providedIn: 'root',
})
export class PageViewDataCollector {
  private readonly accountStateService = inject(AccountStateService);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly storageService = inject(StorageService);
  private readonly pointOfSaleService = inject(PointOfSaleService);

  public collectPageViewData(): PageViewAnalyticsEvent['data'] {
    const accountData = this.accountStateService.getAccountData();
    const navigatorLanguage: string = navigator.language?.split('-')[0];

    return {
      country_pos: this.pointOfSaleService.getCurrentPointOfSale()?.stationCode?.toLowerCase() || AnalyticsDataType.NA,
      language: this.cultureServiceEx.getUserCulture().locale || navigatorLanguage,
      language_nav: navigatorLanguage,
      time_zone: 'GMT' + dayjs().format('Z'),
      user_hour: dayjs().format('HH:mm'),
      user_type: accountData?.customerNumber ? AnalyticsUserType.LOGGED_IN : AnalyticsUserType.GUEST,
      user_id: AnalyticsDataType.NA,
      ga_session_id: Date.now(),
      page_location: globalThis.location.href,
      page_referrer: document.referrer,
      page_title: document.title,
      screen_resolution: `${globalThis.screen.width}x${globalThis.screen.height}`,
      ...(this.isWCIFlow() && {
        page_name: this.getPageName(),
        payment_provider: AnalyticsDataType.NA,
      }),
    };
  }

  private getPageName(): string {
    const url = globalThis.location.pathname;
    const regex = /check-in\/([^/]+)/;
    const match = regex.exec(url);
    return match ? match[1] : '';
  }

  private isWCIFlow(): boolean {
    const bookingSession = this.storageService.getSessionStorage('sessionBooking');
    const sessionStoreFlow = bookingSession?.bookingInfo?.sessionFlowType;
    const sessionFlowTypeArray = Object.keys(BookingModels.SessionFlowType).map(
      (key) => BookingModels.SessionFlowType[key as keyof typeof BookingModels.SessionFlowType]
    );
    return BookingModels.SessionFlowType.Checkin === sessionFlowTypeArray[Number(sessionStoreFlow)];
  }
}
