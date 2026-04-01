import { PricingChargeType } from '../enums/pricing-charge-type.enum';

export interface PricingCharge {
  type: PricingChargeType;
  code: string;
  amount: number;
  currency: string;
}
