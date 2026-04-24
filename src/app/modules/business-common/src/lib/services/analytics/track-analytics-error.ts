import { inject, Injectable } from '@angular/core';
import { AnalyticsService } from '@dcx/module/analytics';
import { CultureServiceEx, EnumStorageKey, StorageService } from '@dcx/ui/libs';

import { AccountStateService } from '../account-state/account-state.service';

import { AnalyticsDataType, AnalyticsEventType, AnalyticsUserType } from '../../enums';

import { BaseItemsMapper } from './interfaces/base-items.mapper';
import { DataEventModel } from './models/data-event.model';

@Injectable({ providedIn: 'root' })
export class TrackAnalyticsErrorService {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly baseItemsMapper = inject(BaseItemsMapper);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly accountStateService = inject(AccountStateService);
  private readonly storageService = inject(StorageService);

  public trackAnalyticsError(dataEvent: DataEventModel): void {
    const accountData = this.accountStateService.getAccountData();
    const session = this.storageService.getSessionStorage(EnumStorageKey.SessionBooking);
    const bookingPnr = dataEvent.pnr ?? session?.bookingInfo?.recordLocator ?? AnalyticsDataType.NA;

    this.analyticsService.trackEvent({
      eventName: AnalyticsEventType.ERROR_POPUP,
      data: {
        event_category: this.baseItemsMapper.getEventCategory(document.location.pathname),
        page_location: document.location.href,
        page_referrer: document.referrer,
        page_title: document.title,
        language: this.cultureServiceEx.getUserCulture().locale,
        screen_resolution: globalThis.screen.width + 'x' + globalThis.screen.height,
        user_type: accountData?.customerNumber ? AnalyticsUserType.LOGGED_IN : AnalyticsUserType.GUEST,
        user_id: AnalyticsDataType.NA,
        page_name: this.baseItemsMapper.getPageNameByPathName(document.location.pathname),
        error_pnr: bookingPnr,
        error_desc: dataEvent.message,
        error_id: dataEvent.error_id ?? AnalyticsDataType.NA,
      },
    });
  }
}
