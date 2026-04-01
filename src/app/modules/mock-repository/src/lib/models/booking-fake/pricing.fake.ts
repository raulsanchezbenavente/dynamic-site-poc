import { Breakdown, PerPax, PerPaxJourney, PerPaxSegment, Pricing } from '@dcx/ui/libs';

export const PRICING_FAKE: Pricing = {
  totalAmount: 0,
  balanceDue: 45777,
  isBalanced: false,
  currency: 'COP',
  breakdown: {
    perPax: [] as PerPax[],
    perPaxJourney: [] as PerPaxJourney[],
    perPaxSegment: [] as PerPaxSegment[],
  } as Breakdown,
};
