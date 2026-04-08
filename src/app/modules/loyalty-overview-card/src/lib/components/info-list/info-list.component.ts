import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LoyaltyOverviewCard } from '../../models/loyalty-overview-card.model';
import { LoyaltyOverviewCardExpirationDateComponent } from '../expiration-date/expiration-date.component';
import { LoyaltyOverviewCardLoyaltyNumberComponent } from '../loyalty-number/loyalty-number.component';
import { LoyaltyOverviewCardTotalMilesComponent } from '../total-miles/total-miles.component';

@Component({
  selector: 'loyalty-overview-card-info-list',
  templateUrl: './info-list.component.html',
  styleUrls: ['./styles/info-list.styles.scss'],
  imports: [
    LoyaltyOverviewCardLoyaltyNumberComponent,
    LoyaltyOverviewCardTotalMilesComponent,
    LoyaltyOverviewCardExpirationDateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardInfoListComponent {
  public data = input.required<LoyaltyOverviewCard>();
}
