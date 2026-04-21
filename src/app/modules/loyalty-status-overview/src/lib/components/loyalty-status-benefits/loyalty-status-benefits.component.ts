import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import {
  DescriptionList,
  DescriptionListComponent,
  DescriptionListLayoutType,
  DescriptionListOptionType,
  ListComponent,
  ListConfig,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LoyaltyStatusVm } from '../../models/loyalty-status-vm.model';
import { LoyaltyStatus } from '../../models/loyalty-status.model';
import { LoyaltyTierBadgeConfig } from '../../models/loyalty-tier-badge.config';
import { LoyaltyTierBadgeComponent } from '../loyalty-tier-badge/loyalty-tier-badge.component';

@Component({
  selector: 'loyalty-status-benefits',
  templateUrl: './loyalty-status-benefits.component.html',
  styleUrls: ['./styles/loyalty-status-benefits.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    NgClass,
    LoyaltyTierBadgeComponent,
    ListComponent,
    DescriptionListComponent,
    PanelComponent,
    PanelContentDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
})
export class LoyaltyStatusBenefitsComponent implements OnInit {
  @Input() public data = signal<LoyaltyStatusVm>({} as LoyaltyStatusVm);
  public tierInfo!: LoyaltyStatus;
  public tierBadgeConfig!: LoyaltyTierBadgeConfig;
  public panelConfig!: PanelBaseConfig;
  public descriptionListConfig!: DescriptionList;
  public benefitsListConfig!: ListConfig;

  private readonly translate = inject(TranslateService);

  public ngOnInit(): void {
    this.tierInfo = this.data().tier;
    this.setPanelConfig();
    this.setTierBadgeConfig();
    this.setDescriptionListConfig();
    this.setBenefitsListConfig();
  }

  private setBenefitsListConfig(): void {
    this.benefitsListConfig = {
      items: this.tierInfo.benefits.items,
    };
  }

  private setDescriptionListConfig(): void {
    this.descriptionListConfig = {
      options: [
        {
          term: this.translate.instant('Loyalty.StatusBenefitsRequirements.Miles'),
          type: DescriptionListOptionType.TEXT,
          description: {
            text: this.data().milesRequired,
          },
        },
        {
          term: this.translate.instant('Loyalty.StatusBenefitsRequirements.AviancaMiles'),
          type: DescriptionListOptionType.TEXT,
          description: {
            text: this.data().minMilesWithAvianca,
          },
        },
      ],
      layout: DescriptionListLayoutType.COLUMN,
    };
  }

  private setPanelConfig(): void {
    this.panelConfig = {
      appearance: PanelAppearance.BGFILL,
    };
  }

  private setTierBadgeConfig(): void {
    this.tierBadgeConfig = {
      tierName: this.tierInfo.tierName,
    };
  }
}
