import { Injectable } from '@angular/core';
import { ProgressBarConfig } from '@dcx/ui/design-system';
import { LoyaltyBalance, RewardType } from '@dcx/ui/libs';

import { LoyaltyProgressBuilderInterface } from '../interfaces/loyalty-progress-builder.interface';
import { LoyaltyProgressCardVM } from '../models/loyalty-progress-card-vm.model';

@Injectable()
export class LoyaltyProgressBuilderService implements LoyaltyProgressBuilderInterface {
  public getData(): LoyaltyProgressCardVM[] {
    return [
      {
        balance: {
          type: RewardType.POINTS,
          programCode: 'lm',
          amount: 6000,
          currency: 'usd',
          expirationDate: new Date('31-12-2030'),
        } as LoyaltyBalance,
        progressBarConfig: {
          min: {
            label: 'Red Plus',
            value: 4000,
          },
          max: {
            label: 'Silver',
            value: 8000,
          },
          currentValue: 6000,
          ariaAttributes: {
            ariaLabel: 'lifemiles Program',
          },
        } as ProgressBarConfig,
      } as LoyaltyProgressCardVM,
      {
        balance: {
          type: RewardType.POINTS,
          programCode: 'av',
          amount: 8000,
          currency: 'usd',
          expirationDate: new Date('31-12-2030'),
        } as LoyaltyBalance,
        progressBarConfig: {
          min: {
            label: 'Red Plus',
            value: 6000,
          },
          max: {
            label: 'Silver',
            value: 12000,
          },
          currentValue: 8000,
          ariaAttributes: {
            ariaLabel: 'Avianca Miles Program',
          },
        } as ProgressBarConfig,
      } as LoyaltyProgressCardVM,
    ];
  }
}
