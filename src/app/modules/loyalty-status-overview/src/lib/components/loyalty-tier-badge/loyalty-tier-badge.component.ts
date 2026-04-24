import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { LoyaltyTierBadgeConfig } from '../../models/loyalty-tier-badge.config';

@Component({
  selector: 'loyalty-tier-badge',
  templateUrl: 'loyalty-tier-badge.component.html',
  styleUrls: ['./styles/loyalty-tier-badge.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'loyalty-tier-badge',
  },
})
export class LoyaltyTierBadgeComponent {
  @Input() public config!: LoyaltyTierBadgeConfig;
}
