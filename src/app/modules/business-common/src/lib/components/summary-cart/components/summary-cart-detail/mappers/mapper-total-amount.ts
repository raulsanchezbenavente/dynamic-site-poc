import { EnumChargesType, EnumFareTypes, FARE_ORDER_MAP, JourneyVM, Pricing } from '@dcx/ui/libs';

/**
 * Calculates the total amount for a journey by summing up per-passenger
 * and per-journey pricing, including FARE and TAX charges.
 */
export function getTotalAmountForJourney(journey: JourneyVM, pricing: Pricing): number {
  let total = 0;

  if (pricing?.breakdown?.perPaxJourney) {
    const filteredJourneys = pricing.breakdown.perPaxJourney.filter((j) => j.journeyId === journey.id);
    for (const j of filteredJourneys) {
      total += j.totalAmount;
    }
  }

  if (pricing?.breakdown?.perPax) {
    const filteredPax = pricing.breakdown.perPax.filter((j) =>
      j.charges.some((c) => c.type === EnumChargesType.FARE || c.type === EnumChargesType.TAX)
    );
    for (const j of filteredPax) {
      total += j.totalAmount;
    }
  }

  return total;
}

/**
 * Returns visual information from the selected fare in the journey,
 * used for display purposes (e.g., labels, CSS classes).
 */
export function getFareVisualInfo(journey: JourneyVM): { fareName: string; fareClass: string } {
  if (!journey) {
    return { fareName: '', fareClass: '' };
  }
  const selectedFare = journey.fares?.[0];
  const fareOrder = selectedFare?.productClass ? (FARE_ORDER_MAP[selectedFare.productClass as EnumFareTypes] ?? 0) : 0;
  return {
    fareName: selectedFare ? selectedFare.productClass + selectedFare.serviceBundleCode : '',
    fareClass: fareOrder.toString(),
  };
}
