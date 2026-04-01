import { PricingCharge } from '../common/pricing-charge.dto';

export interface ServiceAvailabilityDto {
  sellKey: string;
  isInventoried: boolean;
  availableUnits: number;
  limitPerPax: number;
  paxId: string;
  expirationDate: Date;
  charges: PricingCharge[];
}
