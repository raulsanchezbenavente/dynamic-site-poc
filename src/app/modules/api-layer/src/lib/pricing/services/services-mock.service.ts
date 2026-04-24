import { Injectable } from '@angular/core';

import { PricingChargeType, PricingProductScopeType, ServiceDto } from '..';

type BookingForMock = {
  journeys: Array<{ id: string; segments: Array<{ id: string }> }>;
  pax: Array<{ id: string }>;
  pricing?: { currency: string };
};

const SPECIAL_ASSISTANCE_DEFINITIONS: Array<{
  id: string;
  referenceId: string;
  code: string;
  name: string;
  category: string;
}> = [
  {
    id: '424C4E447E424C494E442050415353454E47455220494E464F524D4154494F4E7E5370656369616C417373697374616E63657E424C4E442E36315F5354315F535432',
    referenceId: 'BLND.61_ST1_ST2',
    code: 'BLND',
    name: 'BLIND PASSENGER INFORMATION',
    category: 'default',
  },
  {
    id: '444541467E444541462050415353454E47455220494E464F524D4154494F4E7E5370656369616C417373697374616E63657E444541462E36375F5354315F535432',
    referenceId: 'DEAF.67_ST1_ST2',
    code: 'DEAF',
    name: 'DEAF PASSENGER INFORMATION',
    category: 'default',
  },
  {
    id: '44504E417E44495341424C45442050415353454E474552204E454544494E4720415353495354414E43457E5370656369616C417373697374616E63657E44504E412E38355F5354315F535432',
    referenceId: 'DPNA.85_ST1_ST2',
    code: 'DPNA',
    name: 'DISABLED PASSENGER NEEDING ASSISTANCE',
    category: 'default',
  },
  {
    id: '5356414E7E50415353454E4745522057495448205345525649434520414E494D414C20494E20434142494E7E5370656369616C417373697374616E63657E5356414E2E3130335F5354315F535432',
    referenceId: 'SVAN.103_ST1_ST2',
    code: 'SVAN',
    name: 'PASSENGER WITH SERVICE ANIMAL IN CABIN',
    category: 'default',
  },
  {
    id: '574348437E574845454C434841495220544F205345415420524551554553547E5370656369616C417373697374616E63657E574348432E3131325F5354315F535432',
    referenceId: 'WCHC.112_ST1_ST2',
    code: 'WCHC',
    name: 'WHEELCHAIR TO SEAT REQUEST',
    category: 'weelchair',
  },
  {
    id: '574348527E574845454C434841495220544F20414952435241465420444F4F5220524551554553547E5370656369616C417373697374616E63657E574348522E3131355F5354315F535432',
    referenceId: 'WCHR.115_ST1_ST2',
    code: 'WCHR',
    name: 'WHEELCHAIR TO AIRCRAFT DOOR REQUEST',
    category: 'weelchair',
  },
  {
    id: '57434D507E574845454C4348414952204D414E55414C20504F574552454420524551554553547E5370656369616C417373697374616E63657E57434D502E3132345F5354315F535432',
    referenceId: 'WCMP.124_ST1_ST2',
    code: 'WCMP',
    name: 'WHEELCHAIR MANUAL POWERED REQUEST',
    category: 'weelchair',
  },
];

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
   * Generates all mock services based on booking and URL parameter.
   * Includes MedicalInsurance (PerPaxJourney) and SpecialAssistance (PerPaxSegment) services.
   * @param booking Current booking from session
   * @returns Array of mock services (empty if no mock should be added)
   */
  public generateMockServices(booking: BookingForMock): ServiceDto[] {
    const urlParams = new URLSearchParams(window.location.search);
    const testCase = parseInt(urlParams.get('availabilityCase') || '4', 10);

    if (testCase === 4) {
      return [];
    }

    const result: ServiceDto[] = [];

    const medicalInsuranceMock = this.generateMedicalInsuranceMock(booking, testCase);
    if (medicalInsuranceMock) {
      result.push(medicalInsuranceMock);
    }

    const specialAssistanceMocks = this.generateSpecialAssistanceMocks(booking, testCase);
    result.push(...specialAssistanceMocks);

    return result;
  }

  private generateMedicalInsuranceMock(booking: BookingForMock, testCase: number): ServiceDto | null {
    const availability = this.generateJourneyAvailability(
      booking,
      testCase,
      'ASST',
      booking.pricing?.currency ?? 'USD',
      40000
    );

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

  private generateSpecialAssistanceMocks(booking: BookingForMock, testCase: number): ServiceDto[] {
    const segmentAvailability = this.generateSegmentAvailability(booking, testCase);

    if (segmentAvailability.length === 0) {
      return [];
    }

    return SPECIAL_ASSISTANCE_DEFINITIONS.map((def) => ({
      id: def.id,
      referenceId: def.referenceId,
      info: {
        code: def.code,
        type: 'SpecialAssistance',
        name: def.name,
        category: def.category,
        ordinalNumber: 0,
      },
      availability: segmentAvailability.map((entry) => ({
        ...entry,
        charges: [
          { type: PricingChargeType.SERVICE, code: def.code, amount: 0, currency: booking.pricing?.currency ?? 'USD' },
        ],
      })),
      sellType: PricingProductScopeType.PER_PAX_SEGMENT,
    }));
  }

  private getJourneysToInclude(journeys: BookingForMock['journeys'], testCase: number): BookingForMock['journeys'] {
    switch (testCase) {
      case 1:
        return journeys.slice(0, 1);
      case 2:
        return journeys.length > 1 ? [journeys[1]] : [];
      default:
        return journeys;
    }
  }

  private generateJourneyAvailability(
    booking: BookingForMock,
    testCase: number,
    code: string,
    currency: string,
    amount: number
  ): ServiceDto['availability'] {
    const journeysToInclude = this.getJourneysToInclude(booking.journeys.slice(0, 2), testCase);
    const availability: ServiceDto['availability'] = [];

    for (const journey of journeysToInclude) {
      for (const passenger of booking.pax) {
        availability.push({
          sellKey: journey.id,
          isInventoried: false,
          availableUnits: 999,
          limitPerPax: 1,
          paxId: passenger.id,
          expirationDate: new Date('0001-01-01T00:00:00'),
          charges: [{ type: PricingChargeType.SERVICE, code, amount, currency }],
        });
      }
    }

    return availability;
  }

  private generateSegmentAvailability(
    booking: BookingForMock,
    testCase: number
  ): Array<Omit<ServiceDto['availability'][number], 'charges'>> {
    const journeysToInclude = this.getJourneysToInclude(booking.journeys.slice(0, 2), testCase);
    const entries: Array<Omit<ServiceDto['availability'][number], 'charges'>> = [];

    for (const journey of journeysToInclude) {
      for (const segment of journey.segments) {
        for (const passenger of booking.pax) {
          entries.push({
            sellKey: segment.id,
            isInventoried: false,
            availableUnits: 999,
            limitPerPax: 1,
            paxId: passenger.id,
            expirationDate: new Date('0001-01-01T00:00:00'),
          });
        }
      }
    }

    return entries;
  }
}
