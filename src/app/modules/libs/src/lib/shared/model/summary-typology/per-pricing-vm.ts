import { PerPricing } from '../pricing';

export interface PerPricingVm extends PerPricing {
  paxId?: string;
  sellType?: string;
}
