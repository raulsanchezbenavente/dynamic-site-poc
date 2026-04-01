import { RewardType } from '../../enums';

import { QualifyingPoints } from './qualifying-points.model';

export interface LoyaltyBalance {
  type: RewardType;
  programCode: string;
  amount: number;
  currency?: string;
  expirationDate?: Date;
  qualifyingPoints?: QualifyingPoints[];
}
