import { FareBenefitsList } from '@dcx/ui/libs';

export interface FareOptionsItem {
  id: string;
  /**
   * Used to get CMS dictionary key for fare name translation dictionary key
   */
  key: string;
  benefitsList: FareBenefitsList;
  price: {
    amount: number;
    currency: string;
  };
  isRecommended?: boolean;
  isDisabled?: boolean;
  isSoldOut?: boolean;
}
