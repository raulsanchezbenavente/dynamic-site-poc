import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TierAvatarComponent, TierAvatarConfig } from '@dcx/ui/business-common';
import { TranslateModule } from '@ngx-translate/core';

import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

@Component({
  selector: 'loyalty-overview-card-total-miles',
  templateUrl: './total-miles.component.html',
  styleUrls: ['./styles/total-miles.styles.scss'],
  imports: [TranslateModule, TierAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardTotalMilesComponent {
  public amount = input.required<string>();
  public tierAvatarConfig = input.required<TierAvatarConfig>();
  public readonly translateKeys = LoyaltyOverviewCardTranslationKeys;
}
