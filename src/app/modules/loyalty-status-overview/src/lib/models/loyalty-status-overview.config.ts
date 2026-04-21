import { IconConfig } from '@dcx/ui/libs';

import { LoyaltyStatus } from './loyalty-status.model';

export interface LoyaltyStatusOverviewConfig {
  culture: string;
  title: string;
  description: string;
  loyaltyStatus: LoyaltyStatus[];
  discover: {
    title: string;
    icon?: IconConfig;
    description: string;
    buttonLabel: string;
  };
}
