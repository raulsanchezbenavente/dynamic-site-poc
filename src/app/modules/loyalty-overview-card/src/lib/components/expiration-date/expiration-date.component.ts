import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DateDisplayComponent, DateDisplayConfig } from '@dcx/ui/design-system';
import { TranslateModule } from '@ngx-translate/core';

import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

@Component({
  selector: 'loyalty-overview-card-expiration-date',
  templateUrl: './expiration-date.component.html',
  styleUrls: ['./styles/expiration-date.styles.scss'],
  imports: [TranslateModule, DateDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardExpirationDateComponent {
  public expirationDateConfig = input.required<DateDisplayConfig>();
  public amount = input.required<string>();
  public readonly translateKeys = LoyaltyOverviewCardTranslationKeys;
}
