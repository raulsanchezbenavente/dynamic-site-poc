import { PricingLeg } from './pricing-leg.dto';
import { PricingTransport } from './pricing-transport.dto';

export interface PricingSegment {
  referenceId: string;
  departureGate: string;
  legs: PricingLeg[];
  marketingTransport: PricingTransport;
  operatingTransport: PricingTransport;
}
