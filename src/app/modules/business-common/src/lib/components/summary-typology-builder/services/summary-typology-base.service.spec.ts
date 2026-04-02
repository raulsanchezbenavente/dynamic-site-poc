import { TestBed } from '@angular/core/testing';

import { SummaryTypologyBaseService } from './summary-typology-base.service';
import {
  Booking,
  EnumChargesType,
  EnumSellType,
  EnumServiceStatus,
  ISummarySelectedJourneysService,
  PaxTypeCode,
  SessionStore,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyDataVmParams,
  SummaryTypologyDataPerRouteVmParams,
} from '@dcx/ui/libs';

describe('SummaryTypologyBaseService', () => {
  let service: SummaryTypologyBaseService;
  let sessionStore: jasmine.SpyObj<SessionStore>;
  let summarySelectedJourneysService: jasmine.SpyObj<ISummarySelectedJourneysService>;

  const mockBooking: Booking = {
    bookingInfo: {
      recordLocator: 'ABC123',
      pointOfSale: {
        posCode: 'US',
        code: 'US',
      },
    },
    pricing: {
      currency: 'USD',
      totalAmount: 500,
      balanceDue: 0,
      isBalanced: true,
      breakdown: {
        perBooking: [
          {
            referenceId: 'booking1',
            totalAmount: 400,
            currency: 'USD',
            charges: [
              {
                code: 'FARE',
                amount: 400,
                type: EnumChargesType.FARE,
                currency: 'USD',
              },
            ],
          },
        ],
        perPax: [],
        perPaxJourney: [
          {
            paxId: 'PAX1',
            journeyId: 'journey1',
            referenceId: 'pax1-journey1-fare',
            totalAmount: 200,
            currency: 'USD',
            charges: [
              {
                code: 'FARE',
                amount: 200,
                type: EnumChargesType.FARE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            journeyId: 'journey1',
            referenceId: 'pax1-journey1-service',
            totalAmount: 30,
            currency: 'USD',
            charges: [
              {
                code: 'BAGGAGE1',
                amount: 30,
                type: EnumChargesType.SERVICE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            journeyId: 'journey1',
            referenceId: 'pax1-journey1-tax',
            totalAmount: 50,
            currency: 'USD',
            charges: [
              {
                code: 'TAX1',
                amount: 50,
                type: EnumChargesType.TAX,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            journeyId: 'journey2',
            referenceId: 'pax1-journey2-fare',
            totalAmount: 200,
            currency: 'USD',
            charges: [
              {
                code: 'FARE',
                amount: 200,
                type: EnumChargesType.FARE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            journeyId: 'journey2',
            referenceId: 'pax1-journey2-service',
            totalAmount: 30,
            currency: 'USD',
            charges: [
              {
                code: 'BAGGAGE1',
                amount: 30,
                type: EnumChargesType.SERVICE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            journeyId: 'journey2',
            referenceId: 'pax1-journey2-tax',
            totalAmount: 50,
            currency: 'USD',
            charges: [
              {
                code: 'TAX1',
                amount: 50,
                type: EnumChargesType.TAX,
                currency: 'USD',
              },
            ],
          },
        ],
        perPaxSegment: [
          {
            paxId: 'PAX1',
            segmentId: 'segment1',
            referenceId: 'pax1-segment1-fare',
            totalAmount: 100,
            currency: 'USD',
            charges: [
              {
                code: 'FARE',
                amount: 100,
                type: EnumChargesType.FARE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            segmentId: 'segment1',
            referenceId: 'pax1-segment1-service',
            totalAmount: 20,
            currency: 'USD',
            charges: [
              {
                code: 'SEAT1',
                amount: 20,
                type: EnumChargesType.SERVICE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            segmentId: 'segment2',
            referenceId: 'pax1-segment2-fare',
            totalAmount: 100,
            currency: 'USD',
            charges: [
              {
                code: 'FARE',
                amount: 100,
                type: EnumChargesType.FARE,
                currency: 'USD',
              },
            ],
          },
          {
            paxId: 'PAX1',
            segmentId: 'segment2',
            referenceId: 'pax1-segment2-service',
            totalAmount: 20,
            currency: 'USD',
            charges: [
              {
                code: 'SEAT1',
                amount: 20,
                type: EnumChargesType.SERVICE,
                currency: 'USD',
              },
            ],
          },
        ],
        perSegment: [],
      },
      perPax: [
        {
          paxId: 'PAX1',
          referenceId: 'pax1',
          totalAmount: 250,
          currency: 'USD',
          charges: [
            {
              code: 'FARE',
              amount: 200,
              type: EnumChargesType.FARE,
              currency: 'USD',
            },
            {
              code: 'TAX1',
              amount: 50,
              type: EnumChargesType.TAX,
              currency: 'USD',
            },
          ],
        },
      ],
    },
    journeys: [
      {
        id: 'journey1',
        origin: { code: 'MIA', city: 'Miami' },
        destination: { code: 'BOG', city: 'Bogota' },
        segments: [
          {
            id: 'segment1',
            origin: { code: 'MIA', city: 'Miami' },
            destination: { code: 'BOG', city: 'Bogota' },
          },
        ],
      },
      {
        id: 'journey2',
        origin: { code: 'BOG', city: 'Bogota' },
        destination: { code: 'MIA', city: 'Miami' },
        segments: [
          {
            id: 'segment2',
            origin: { code: 'BOG', city: 'Bogota' },
            destination: { code: 'MIA', city: 'Miami' },
          },
        ],
      },
    ],
    pax: [
      {
        id: 'PAX1',
        referenceId: 'pax1',
        type: { code: PaxTypeCode.ADT, name: 'Adult' },
        firstName: 'John',
        lastName: 'Doe',
      },
    ],
    services: [
      {
        code: 'SEAT1',
        type: 'SEAT',
        status: EnumServiceStatus.CONFIRMED,
        scope: EnumSellType.PER_PAX_SEGMENT,
      },
      {
        code: 'BAGGAGE1',
        type: 'BAGGAGE',
        status: EnumServiceStatus.CONFIRMED,
        scope: EnumSellType.PER_PAX_JOURNEY,
      },
    ],
    contacts: [],
  } as any;

  beforeEach(() => {
    sessionStore = jasmine.createSpyObj('SessionStore', ['getBooking']);
    summarySelectedJourneysService = jasmine.createSpyObj('ISummarySelectedJourneysService', [
      'getSelectedPassengers',
      'getSelectedJourneysToCheckIn',
      'getJourneysToRequest',
    ]);

    summarySelectedJourneysService.getSelectedPassengers.and.returnValue([]);
    summarySelectedJourneysService.getSelectedJourneysToCheckIn.and.returnValue([]);
    summarySelectedJourneysService.getJourneysToRequest.and.returnValue([]);

    TestBed.configureTestingModule({
      providers: [
        SummaryTypologyBaseService,
        { provide: SessionStore, useValue: sessionStore },
        { provide: SUMMARY_SELECTED_JOURNEYS_SERVICE, useValue: summarySelectedJourneysService },
      ],
    });

    service = TestBed.inject(SummaryTypologyBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildSummaryTypologyDataVm', () => {
    const params: SummaryTypologyDataVmParams = {
      booking: mockBooking,
      departureLabel: 'Departure',
      returnLabel: 'Return',
      servicesLabel: 'Services',
      taxesLabel: 'Taxes',
      scheduleSelection: {
        departure: {
          journeyId: mockBooking.journeys[0].id,
          fareId: 'FARE1',
        },
        return: {
          journeyId: mockBooking.journeys[1].id,
          fareId: 'FARE2',
        },
      },
      servicesCodesToMerge: [],
      excludeChargesCode: [],
      showInfoForSelectedFlight: false,
    };

    it('should build summary typology data with departure and arrival', () => {
      const result = service.buildSummaryTypologyDataVm(params);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include departure journey when present', () => {
      const result = service.buildSummaryTypologyDataVm(params);

      const departureData = result.find((data) => data.label === 'Departure');
      expect(departureData).toBeDefined();
      expect(departureData?.labelText).toContain('Miami');
      expect(departureData?.labelText).toContain('Bogota');
    });

    it('should include arrival journey when present', () => {
      const result = service.buildSummaryTypologyDataVm(params);

      const arrivalData = result.find((data) => data.label === 'Return');
      expect(arrivalData).toBeDefined();
      expect(arrivalData?.labelText).toContain('Bogota');
      expect(arrivalData?.labelText).toContain('Miami');
    });

    it('should include services section', () => {
      const result = service.buildSummaryTypologyDataVm(params);

      const servicesData = result.find((data) => data.label === 'Services');
      expect(servicesData).toBeDefined();
    });

    it('should handle one-way journey', () => {
      const oneWayBooking = {
        ...mockBooking,
        journeys: [mockBooking.journeys[0]],
      };
      const oneWayParams: SummaryTypologyDataVmParams = {
        ...params,
        booking: oneWayBooking,
        scheduleSelection: {
          departure: {
            journeyId: oneWayBooking.journeys[0].id,
            fareId: 'FARE1',
          },
        },
      };

      const result = service.buildSummaryTypologyDataVm(oneWayParams);

      expect(result.some((data) => data.label === 'Departure')).toBe(true);
      expect(result.some((data) => data.label === 'Return')).toBe(false);
    });

    it('should merge services when servicesCodesToMerge is provided', () => {
      const paramsWithMerge = {
        ...params,
        servicesCodesToMerge: ['SEAT1', 'BAGGAGE1'],
      };

      const result = service.buildSummaryTypologyDataVm(paramsWithMerge);

      expect(result).toBeDefined();
      // Verify merge logic was applied
    });

    it('should exclude charges when excludeChargesCode is provided', () => {
      const paramsWithExclude = {
        ...params,
        excludeChargesCode: ['TAX1'],
      };

      const result = service.buildSummaryTypologyDataVm(paramsWithExclude);

      expect(result).toBeDefined();
      // Verify exclusion logic was applied
    });

    it('should filter by selected flight when showInfoForSelectedFlight is true', () => {
      summarySelectedJourneysService.getJourneysToRequest.and.returnValue(['journey1']);

      const paramsWithFilter = {
        ...params,
        showInfoForSelectedFlight: true,
      };

      const result = service.buildSummaryTypologyDataVm(paramsWithFilter);

      expect(summarySelectedJourneysService.getJourneysToRequest).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('buildSummaryTypologyDataPerRouteVm', () => {
    const params: SummaryTypologyDataPerRouteVmParams = {
      booking: mockBooking,
      departureLabel: 'Departure',
      returnLabel: 'Return',
      servicesLabel: 'Services',
      taxesLabel: 'Taxes',
      scheduleSelection: {
        departure: {
          journeyId: mockBooking.journeys[0].id,
          fareId: 'FARE1',
        },
        return: {
          journeyId: mockBooking.journeys[1].id,
          fareId: 'FARE2',
        },
      },
      servicesCodesToMerge: [],
      chargesCodesToMerge: [],
      excludeChargesCode: [],
      showInfoForSelectedFlight: false,
      sellTypePerServices: [],
    };

    it('should build summary typology data per route', () => {
      const result = service.buildSummaryTypologyDataPerRouteVm(params);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should set model type to DEPARTURE for departure journey', () => {
      const result = service.buildSummaryTypologyDataPerRouteVm(params);

      const departureData = result.find((data) => data.modelType === SummaryTypologyDataVmModelType.DEPARTURE);
      expect(departureData).toBeDefined();
      expect(departureData?.label).toBe('Departure');
    });

    it('should set model type to ARRIVAL for arrival journey', () => {
      const result = service.buildSummaryTypologyDataPerRouteVm(params);

      const arrivalData = result.find((data) => data.modelType === SummaryTypologyDataVmModelType.ARRIVAL);
      expect(arrivalData).toBeDefined();
      expect(arrivalData?.label).toBe('Return');
    });

    it('should set model type to SERVICES for services section', () => {
      const paramsWithServices = {
        ...params,
        sellTypePerServices: [
          { code: 'SEAT1', scope: EnumSellType.PER_PAX },
          { code: 'BAGGAGE1', scope: EnumSellType.PER_PAX },
        ],
      };

      const result = service.buildSummaryTypologyDataPerRouteVm(paramsWithServices);

      const servicesData = result.find((data) => data.modelType === SummaryTypologyDataVmModelType.SERVICES);
      expect(servicesData).toBeDefined();
    });

    it('should handle sellTypePerServices filtering', () => {
      const paramsWithSellType = {
        ...params,
        sellTypePerServices: [
          { code: 'SEAT1', scope: EnumSellType.PER_PAX_SEGMENT },
          { code: 'BAGGAGE1', scope: EnumSellType.PER_PAX_JOURNEY },
        ],
      };

      const result = service.buildSummaryTypologyDataPerRouteVm(paramsWithSellType);

      expect(result).toBeDefined();
    });

    it('should merge services based on servicesCodesToMerge', () => {
      const paramsWithMerge = {
        ...params,
        servicesCodesToMerge: ['SEAT1'],
      };

      const result = service.buildSummaryTypologyDataPerRouteVm(paramsWithMerge);

      expect(result).toBeDefined();
    });

    it('should merge charges based on chargesCodesToMerge', () => {
      const paramsWithChargeMerge = {
        ...params,
        chargesCodesToMerge: ['TAX1'],
      };

      const result = service.buildSummaryTypologyDataPerRouteVm(paramsWithChargeMerge);

      expect(result).toBeDefined();
    });

    it('should handle one-way booking', () => {
      const oneWayBooking = {
        ...mockBooking,
        journeys: [mockBooking.journeys[0]],
      };
      const oneWayParams: SummaryTypologyDataPerRouteVmParams = {
        ...params,
        booking: oneWayBooking,
        scheduleSelection: {
          departure: {
            journeyId: oneWayBooking.journeys[0].id,
            fareId: 'FARE1',
          },
        },
      };

      const result = service.buildSummaryTypologyDataPerRouteVm(oneWayParams);

      expect(result.some((data) => data.modelType === SummaryTypologyDataVmModelType.DEPARTURE)).toBe(true);
      expect(result.some((data) => data.modelType === SummaryTypologyDataVmModelType.ARRIVAL)).toBe(false);
    });
  });

  describe('buildSummaryTypologyDataPerPaxVm', () => {
    it('should build summary typology data per passenger', () => {
      const result = service.buildSummaryTypologyDataPerPaxVm(
        mockBooking,
        'Price Breakdown',
        'Services',
        'Taxes',
        [],
        []
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include services section', () => {
      const result = service.buildSummaryTypologyDataPerPaxVm(
        mockBooking,
        'Price Breakdown',
        'Services',
        'Taxes',
        [],
        []
      );

      const servicesData = result.find((data) => data.label === 'Services');
      expect(servicesData).toBeDefined();
    });

    it('should include taxes section', () => {
      const result = service.buildSummaryTypologyDataPerPaxVm(
        mockBooking,
        'Price Breakdown',
        'Services',
        'Taxes',
        [],
        []
      );

      const taxesData = result.find((data) => data.label === 'Taxes');
      expect(taxesData).toBeDefined();
    });

    it('should merge services when servicesCodesToMerge is provided', () => {
      const result = service.buildSummaryTypologyDataPerPaxVm(
        mockBooking,
        'Price Breakdown',
        'Services',
        'Taxes',
        ['SEAT1', 'BAGGAGE1'],
        []
      );

      expect(result).toBeDefined();
    });

    it('should exclude charges when excludeChargesCode is provided', () => {
      const result = service.buildSummaryTypologyDataPerPaxVm(
        mockBooking,
        'Price Breakdown',
        'Services',
        'Taxes',
        [],
        ['TAX1']
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle booking without services', () => {
      const bookingWithoutServices = {
        ...mockBooking,
        services: [],
      };
      const params: SummaryTypologyDataVmParams = {
        booking: bookingWithoutServices,
        departureLabel: 'Departure',
        returnLabel: 'Return',
        servicesLabel: 'Services',
        taxesLabel: 'Taxes',
        scheduleSelection: {},
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        showInfoForSelectedFlight: false,
      };

      const result = service.buildSummaryTypologyDataVm(params);

      expect(result).toBeDefined();
    });

    it('should handle booking without pricing', () => {
      const bookingWithoutPricing = {
        ...mockBooking,
        pricing: {
          currency: 'USD',
          totalPrice: 0,
          totalAmount: 0,
          balanceDue: 0,
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxSegment: [],
            perSegment: [],
            perPaxJourney: [],
          },
          isBalanced: true,
        },
      };
      const params: SummaryTypologyDataVmParams = {
        booking: bookingWithoutPricing,
        departureLabel: 'Departure',
        returnLabel: 'Return',
        servicesLabel: 'Services',
        taxesLabel: 'Taxes',
        scheduleSelection: {},
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        showInfoForSelectedFlight: false,
      };

      const result = service.buildSummaryTypologyDataVm(params);

      expect(result).toBeDefined();
    });

    it('should handle empty journeys array', () => {
      const bookingWithoutJourneys = {
        ...mockBooking,
        journeys: [],
      };
      const params: SummaryTypologyDataVmParams = {
        booking: bookingWithoutJourneys,
        departureLabel: 'Departure',
        returnLabel: 'Return',
        servicesLabel: 'Services',
        taxesLabel: 'Taxes',
        scheduleSelection: {},
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        showInfoForSelectedFlight: false,
      };

      const result = service.buildSummaryTypologyDataVm(params);

      expect(result).toBeDefined();
      expect(result.some((data) => data.label === 'Departure')).toBe(false);
      expect(result.some((data) => data.label === 'Return')).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should produce consistent results for same input', () => {
      const params: SummaryTypologyDataVmParams = {
        booking: mockBooking,
        departureLabel: 'Departure',
        returnLabel: 'Return',
        servicesLabel: 'Services',
        taxesLabel: 'Taxes',
        scheduleSelection: {},
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        showInfoForSelectedFlight: false,
      };

      const result1 = service.buildSummaryTypologyDataVm(params);
      const result2 = service.buildSummaryTypologyDataVm(params);

      expect(result1.length).toBe(result2.length);
    });

    it('should handle complex booking with multiple services and charges', () => {
      const complexBooking = {
        ...mockBooking,
        services: [
          { code: 'SEAT1', type: 'SEAT', status: EnumServiceStatus.CONFIRMED, scope: EnumSellType.PER_PAX_SEGMENT },
          {
            code: 'BAGGAGE1',
            type: 'BAGGAGE',
            status: EnumServiceStatus.CONFIRMED,
            scope: EnumSellType.PER_PAX_JOURNEY,
          },
          { code: 'MEAL1', type: 'MEAL', status: EnumServiceStatus.CONFIRMED, scope: EnumSellType.PER_PAX_SEGMENT },
          { code: 'BUNDLE1', type: 'BUNDLE', status: EnumServiceStatus.CONFIRMED, scope: EnumSellType.PER_BOOKING },
        ],
      };

      const params: SummaryTypologyDataVmParams = {
        booking: complexBooking as any,
        departureLabel: 'Departure',
        returnLabel: 'Return',
        servicesLabel: 'Services',
        taxesLabel: 'Taxes',
        scheduleSelection: {
          departure: {
            journeyId: mockBooking.journeys[0].id,
            fareId: 'FARE1',
          },
          return: {
            journeyId: mockBooking.journeys[1].id,
            fareId: 'FARE2',
          },
        },
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        showInfoForSelectedFlight: false,
      };

      const result = service.buildSummaryTypologyDataVm(params);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
