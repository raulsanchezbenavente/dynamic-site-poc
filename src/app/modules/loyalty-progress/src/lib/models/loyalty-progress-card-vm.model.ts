import { ProgressBarConfig } from '@dcx/ui/design-system';
import { LoyaltyBalance } from '@dcx/ui/libs';

export interface LoyaltyProgressCardVM {
  balance: LoyaltyBalance;
  progressBarConfig: ProgressBarConfig;
}
