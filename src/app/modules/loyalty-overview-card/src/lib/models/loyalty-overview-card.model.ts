import { TierAvatarConfig } from '@dcx/ui/business-common';
import { DateDisplayConfig } from '@dcx/ui/design-system';

export interface LoyaltyOverviewCard {
  greeting: string;
  tierName: string;
  mainColor?: string;
  darkerColor?: string;
  userFullName: string;
  loyaltyId: string;
  amount: string;
  expirationDateConfig: DateDisplayConfig;
  tierAvatarConfig: TierAvatarConfig;
}
