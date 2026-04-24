import { Charge } from './../model/charge';

export interface PerPricing {
  referenceId: string;
  sellKey?: string;
  totalAmount: number;
  currency: string;
  charges: Charge[];
}

export interface Pricing {
  totalAmount: number;
  balanceDue: number;
  isBalanced: boolean;
  currency: string;
  breakdown: Breakdown;
}

export interface Breakdown {
  perBooking: PerPricing[];
  perPax: PerPax[];
  perPaxSegment: PerPaxSegment[];
  perSegment: PerPricing[];
  perPaxJourney: PerPaxJourney[];
}

export interface PerPaxJourney extends PerPricing {
  paxId: string;
  journeyId: string;
}

export interface PerPaxSegment extends PerPricing {
  paxId: string;
  segmentId: string;
}

export interface PerPax extends PerPricing {
  paxId: string;
}
