import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
import { ProgressBarComponent } from '@dcx/storybook/design-system';
import { LoyaltyPoints, LoyaltyPointsComponent } from '@dcx/ui/business-common';

import { LoyaltyProgressCardVM } from '../../models/loyalty-progress-card-vm.model';

@Component({
  selector: 'loyalty-progress-card',
  templateUrl: './loyalty-progress-card.component.html',
  styleUrls: ['./styles/loyalty-progress-card.component.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, LoyaltyPointsComponent, ProgressBarComponent],
})
export class LoyaltyProgressCardComponent implements OnInit {
  public config = input.required<LoyaltyProgressCardVM>();
  public loyaltyPointsModel = signal<LoyaltyPoints>({
    amount: '',
  });

  public ngOnInit(): void {
    this.setLoyaltyPointsModel();
  }

  private setLoyaltyPointsModel(): void {
    this.loyaltyPointsModel.set({
      amount: this.config().balance.amount.toString(),
      label: 'Loyalty.Progress.PointsLabel.' + this.config().balance.programCode.toUpperCase(),
    });
  }
}
