import { PricingCharge } from '../common/pricing-charge.dto';

import { PricingFareItem } from './pricing-fare-item.dto';

export interface PricingFare {
  referenceId: string;
  fareBasisCode: string;
  classOfService: string;
  productClass: string;
  availableSeats: number;
  paxCode: string;
  promoCode: string;
  corporateCode: string;
  serviceBundleCode: string;
  charges: PricingCharge[];
  cabin: string;
  recommended: boolean;
  name: string;
  items: PricingFareItem[];
  availableSegments: string[];
  substituteCabin: string;
}
