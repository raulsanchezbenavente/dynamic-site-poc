import { LoyaltyStatus } from './loyalty-status.model';

export interface LoyaltyStatusVm {
  title: string;
  tier: LoyaltyStatus;
  milesRequired: number;
  minMilesWithAvianca: number;
}