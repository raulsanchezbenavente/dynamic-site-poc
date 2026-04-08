import { inject, Injectable } from '@angular/core';
import { CustomerLoyaltyService, LoyaltyTranslationKeys } from '@dcx/ui/business-common';
import { AvatarSize } from '@dcx/ui/design-system';
import { CultureServiceEx, TextHelperService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { map, Observable } from 'rxjs';
dayjs.extend(utc);

import { LoyaltyOverviewCardTranslationKeys } from '../enums/loyalty-overview-card-translation-keys.enum';
import { LoyaltyOverviewCardBuilderData } from '../models/loyalty-overview-card-builder-data.model';
import { LoyaltyOverviewCard } from '../models/loyalty-overview-card.model';

@Injectable({ providedIn: 'root' })
export class LoyaltyOverviewCardBuilderService {
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly translateService = inject(TranslateService);
  private readonly textHelperService = inject(TextHelperService);
  private readonly customerLoyaltyService = inject(CustomerLoyaltyService);
  private readonly iconName = 'lifemiles';

  public getData(data: LoyaltyOverviewCardBuilderData): Observable<LoyaltyOverviewCard> {
    const userData = data.account;
    const fullName = this.textHelperService.getCapitalizeWords(
      `${userData.firstName} ${userData.middleName} ${userData.lastName}`
    );
    const name = this.textHelperService.getCapitalizeWords(`${userData.firstName}`);
    const format = this.customerLoyaltyService.formatLoyaltyBalance(userData.balance);
    const formatPattern = this.cultureServiceEx.getUserCulture?.()?.longDateFormat ?? 'MMM d, YYYY';

    return this.customerLoyaltyService.getCustomerProgramData(userData).pipe(
      map((program) => ({
        greeting: this.translateService.instant(LoyaltyOverviewCardTranslationKeys.OverviewCard_Greeting_Text, {
          name,
        }),
        amount: format,
        loyaltyId: program.loyaltyId,
        tierName: program.tierName,
        mainColor: program.mainColor,
        darkerColor: program.darkerColor,
        userFullName: fullName,
        expirationDateConfig: {
          date: dayjs.utc(userData.balance?.lifemiles?.expiryDate),
          format: formatPattern,
        },
        tierAvatarConfig: {
          size: data.isMobile ? AvatarSize.SMALLEST : AvatarSize.EXTRA_SMALL,
          icon: {
            name: this.iconName,
            ariaAttributes: {
              ariaLabel: this.translateService.instant(LoyaltyTranslationKeys.Lifemiles_Text),
            },
          },
          tierName: program.tierName,
          mainColor: program.mainColor,
          darkerColor: program.darkerColor,
        },
      }))
    );
  }
}
