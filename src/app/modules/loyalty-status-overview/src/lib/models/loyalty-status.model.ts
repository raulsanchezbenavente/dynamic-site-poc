import { Image } from '@dcx/ui/libs';
import { TierBenefitList } from './tier-benefit-list.model';

export interface LoyaltyStatus {
  id: number;
  cardImage: Image;
  tierName: string;
  benefits: TierBenefitList;
}