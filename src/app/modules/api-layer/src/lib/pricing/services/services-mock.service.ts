import { Injectable } from '@angular/core';

import { PricingChargeType, PricingProductScopeType, ServiceDto } from '..';

/**
 * Service responsible for generating mock service data for testing purposes.
 * Test cases controlled by URL parameter ?availabilityCase=N:
 * - availabilityCase=1: Availability only for first journey (all passengers)
 * - availabilityCase=2: Availability only for second journey (all passengers) - if exists
 * - availabilityCase=3: Availability for all journeys (all passengers)
 * - No parameter (default): No mock service
 */
@Injectable({
  providedIn: 'root',
})
export class ServicesMockService {
  /**
   * Generates mock service based on booking and URL parameter
   * @param booking Current booking from session
   * @returns Mock service or null if no mock should be added
   */
  public generateMockService(booking: {
    journeys: Array<{ id: string }>;
    pax: Array<{ id: string }>;
    pricing?: { currency: string };
  }): ServiceDto | null {
    // Get test case from URL parameter ?availabilityCase=N (default: 4 - no availability)
    const urlParams = new URLSearchParams(window.location.search);
    const testCase = parseInt(urlParams.get('availabilityCase') || '4', 10);

    // Case 4 (default): No mock service
    if (testCase === 4) {
      return null;
    }

    // Generate dynamic availability based on booking journeys and passengers
    const availability = this.generateMockAvailability(booking, testCase);

    // Only add mock service if there's availability
    if (availability.length === 0) {
      return null;
    }

    return {
      id: '415353547E54524156454C204153495354414E43457E4D65646963616C496E737572616E63457E452E3042592E462E35355F5354315F535432',
      referenceId: 'E.0BY.F.55_ST1_ST2',
      info: {
        code: 'ASST',
        type: 'MedicalInsurance',
        name: 'TRAVEL ASSISTANCE',
        category: 'default',
        ordinalNumber: 0,
      },
      availability,
      sellType: PricingProductScopeType.PER_PAX_JOURNEY,
    };
  }

  /**
   * Generates mock availability based on booking journeys, passengers, and test case
   * @param booking Current booking from session
   * @param testCase Test scenario (1-3)
   * @returns Array of service availability entries
   */
  private generateMockAvailability(
    booking: {
      journeys: Array<{ id: string }>;
      pax: Array<{ id: string }>;
      pricing?: { currency: string };
    },
    testCase: number
  ): ServiceDto['availability'] {
    const availability: ServiceDto['availability'] = [];

    // Get journeys from booking (max 2)
    const journeys = booking.journeys.slice(0, 2);

    // Filter passengers (exclude infants if needed)
    const passengers = booking.pax; // Include all passengers

    // Determine which journeys to include based on test case
    let journeysToInclude = journeys;

    switch (testCase) {
      case 1:
        // Only first journey
        journeysToInclude = journeys.slice(0, 1);
        break;
      case 2:
        // Only second journey (if exists)
        journeysToInclude = journeys.length > 1 ? [journeys[1]] : [];
        break;
      case 3:
      default:
        // All journeys
        journeysToInclude = journeys;
        break;
    }

    // Generate availability for each journey + passenger combination
    for (const journey of journeysToInclude) {
      for (const passenger of passengers) {
        availability.push({
          sellKey: journey.id,
          isInventoried: false,
          availableUnits: 999,
          limitPerPax: 1,
          paxId: passenger.id,
          expirationDate: new Date('0001-01-01T00:00:00'),
          charges: [
            {
              type: PricingChargeType.SERVICE,
              code: 'ASST',
              amount: 40000.0,
              currency: booking.pricing?.currency ?? 'USD',
            },
          ],
        });
      }
    }

    return availability;
  }
}
