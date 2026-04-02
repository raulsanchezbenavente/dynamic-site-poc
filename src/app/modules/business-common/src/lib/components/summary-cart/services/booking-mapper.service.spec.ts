import { TestBed } from '@angular/core/testing';
import { BookingMapperService } from './booking-mapper.service';
import { JourneyMapperService } from './journey-mapper.service';
import { Booking as ApiBooking, PricedItem as ApiPricedItem } from '@dcx/ui/api-layer';
import { Pricing, Booking as SharedBooking } from '@dcx/ui/libs';
import { BreakdownKeys } from '../models/breakdown-keys.const';

describe('BookingMapperService', () => {
  let service: BookingMapperService;
  let journeyMapperMock: jasmine.SpyObj<JourneyMapperService>;

  beforeEach(() => {
    journeyMapperMock = jasmine.createSpyObj('JourneyMapperService', ['map']);

    TestBed.configureTestingModule({
      providers: [
        BookingMapperService,
        { provide: JourneyMapperService, useValue: journeyMapperMock },
      ],
    });

    service = TestBed.inject(BookingMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapIfNeeded', () => {
    it('should return SharedBooking directly if bookingFees is defined', () => {
      const sharedBooking = {
        bookingFees: [],
        journeys: [],
      } as unknown as SharedBooking;

      const result = service.mapIfNeeded(sharedBooking as any);

      expect(result).toBe(sharedBooking);
      expect(journeyMapperMock.map).not.toHaveBeenCalled();
    });

    it('should map ApiBooking if bookingFees is undefined', () => {
      const apiBooking: Partial<ApiBooking> = {
        journeys: [],
        pax: [],
        payments: [],
        contacts: [],
        services: [],
        etickets: [],
        pricing: {
          totalAmount: 100,
          balanceDue: 50,
          isBalanced: false,
          currency: 'USD',
          breakdown: {},
        } as any,
        bookingInfo: {
          referenceId: 'ABC123',
          recordLocator: 'LOC123',
          status: 'Confirmed',
          createdDate: new Date(),
          pointOfSale: {},
        } as any,
      };

      journeyMapperMock.map.and.returnValue({} as any);

      const result = service.mapIfNeeded(apiBooking as ApiBooking);

      expect(result.bookingFees).toEqual([]);
      expect(result.pricing).toBeDefined();
      expect(journeyMapperMock.map).not.toHaveBeenCalled();
    });
  });

  describe('mapPricing', () => {
    it('should map PascalCase breakdown keys from API to camelCase for SharedBooking', () => {
      const apiPricing = {
        totalAmount: 200,
        balanceDue: 100,
        isBalanced: false,
        currency: 'EUR',
        breakdown: {
          perPaxJourney: [
            {
              paxId: 'PAX1',
              journeyId: 'J1',
              referenceId: 'REF1',
              sellKey: 'SELL1',
              totalAmount: 50,
              currency: 'EUR',
              charges: [{ type: 'Service', code: 'SURF', amount: 50, currency: 'EUR' }],
            },
          ],
          perPaxSegment: [
            {
              paxId: 'PAX1',
              segmentId: 'SEG1',
              referenceId: 'REF2',
              sellKey: 'SELL2',
              totalAmount: 30,
              currency: 'EUR',
              charges: [{ type: 'Service', code: 'VIPD', amount: 30, currency: 'EUR' }],
            },
          ],
          perPax: [
            {
              paxId: 'PAX1',
              referenceId: 'REF3',
              sellKey: 'SELL3',
              totalAmount: 20,
              currency: 'EUR',
              charges: [],
            },
          ],
          perBooking: [
            {
              referenceId: 'REF4',
              sellKey: 'SELL4',
              totalAmount: 100,
              currency: 'EUR',
              charges: [],
            },
          ],
          perSegment: [],
        },
      };

      const apiBooking: Partial<ApiBooking> = {
        journeys: [],
        pax: [],
        payments: [],
        contacts: [],
        services: [],
        etickets: [],
        pricing: apiPricing as any,
        bookingInfo: {
          referenceId: 'ABC',
          recordLocator: 'LOC',
          status: 'Confirmed',
          createdDate: new Date(),
          pointOfSale: {},
        } as any,
      };

      journeyMapperMock.map.and.returnValue({} as any);

      const result = service.map(apiBooking as ApiBooking);

      // Verify arrays exist
      expect(result.pricing.breakdown.perPaxJourney).toBeDefined();
      expect(Array.isArray(result.pricing.breakdown.perPaxJourney)).toBeTrue();
      expect(result.pricing.breakdown.perPaxJourney.length).toBe(1);
      
      // Verify mapped data
      const perPaxJourney = result.pricing.breakdown.perPaxJourney[0];
      expect(perPaxJourney).toBeDefined();
      expect(perPaxJourney.paxId).toBe('PAX1');
      expect(perPaxJourney.journeyId).toBe('J1');

      expect(result.pricing.breakdown.perPaxSegment).toBeDefined();
      expect(Array.isArray(result.pricing.breakdown.perPaxSegment)).toBeTrue();
      expect(result.pricing.breakdown.perPaxSegment.length).toBe(1);
      
      const perPaxSegment = result.pricing.breakdown.perPaxSegment[0];
      expect(perPaxSegment).toBeDefined();
      expect(perPaxSegment.paxId).toBe('PAX1');
      expect(perPaxSegment.segmentId).toBe('SEG1');

      expect(result.pricing.breakdown.perPax).toBeDefined();
      expect(Array.isArray(result.pricing.breakdown.perPax)).toBeTrue();
      expect(result.pricing.breakdown.perPax.length).toBe(1);

      expect(result.pricing.breakdown.perBooking).toBeDefined();
      expect(Array.isArray(result.pricing.breakdown.perBooking)).toBeTrue();
      expect(result.pricing.breakdown.perBooking.length).toBe(1);
    });

    it('should detect already mapped breakdown (camelCase) and return directly', () => {
      const alreadyMappedPricing = {
        totalAmount: 200,
        balanceDue: 100,
        isBalanced: false,
        currency: 'EUR',
        breakdown: {
          [BreakdownKeys.PER_PAX_JOURNEY]: [
            {
              paxId: 'PAX1',
              journeyId: 'J1',
              referenceId: 'REF1',
              sellKey: 'SELL1',
              totalAmount: 50,
              currency: 'EUR',
              charges: [],
            },
          ],
          [BreakdownKeys.PER_PAX_SEGMENT]: [],
          [BreakdownKeys.PER_PAX]: [],
          [BreakdownKeys.PER_BOOKING]: [],
          [BreakdownKeys.PER_SEGMENT]: [],
        },
      };

      const apiBooking: Partial<ApiBooking> = {
        journeys: [],
        pax: [],
        payments: [],
        contacts: [],
        services: [],
        etickets: [],
        pricing: alreadyMappedPricing as any,
        bookingInfo: {
          referenceId: 'ABC',
          recordLocator: 'LOC',
          status: 'Confirmed',
          createdDate: new Date(),
          pointOfSale: {},
        } as any,
      };

      journeyMapperMock.map.and.returnValue({} as any);

      const result = service.map(apiBooking as ApiBooking);

      // Should return the same breakdown without re-mapping
      expect(result.pricing.breakdown.perPaxJourney).toBeDefined();
      expect(result.pricing.breakdown.perPaxJourney.length).toBe(1);
      expect(result.pricing.breakdown.perPaxJourney[0].paxId).toBe('PAX1');
    });

    it('should handle empty breakdown gracefully', () => {
      const emptyPricing = {
        totalAmount: 0,
        balanceDue: 0,
        isBalanced: true,
        currency: 'USD',
        breakdown: {},
      };

      const apiBooking: Partial<ApiBooking> = {
        journeys: [],
        pax: [],
        payments: [],
        contacts: [],
        services: [],
        etickets: [],
        pricing: emptyPricing as any,
        bookingInfo: {
          referenceId: 'ABC',
          recordLocator: 'LOC',
          status: 'Confirmed',
          createdDate: new Date(),
          pointOfSale: {},
        } as any,
      };

      journeyMapperMock.map.and.returnValue({} as any);

      const result = service.map(apiBooking as ApiBooking);

      expect(result.pricing.breakdown.perPaxJourney).toEqual([]);
      expect(result.pricing.breakdown.perPaxSegment).toEqual([]);
      expect(result.pricing.breakdown.perPax).toEqual([]);
      expect(result.pricing.breakdown.perBooking).toBeDefined();
      expect(result.pricing.breakdown.perSegment).toBeDefined();
    });

    it('should use BreakdownKeys constants for accessing breakdown properties', () => {
      const apiPricing = {
        totalAmount: 100,
        balanceDue: 50,
        isBalanced: false,
        currency: 'USD',
        breakdown: {
          perPaxSegment: [
            {
              paxId: 'PAX1',
              segmentId: 'SEG1',
              referenceId: 'REF1',
              sellKey: 'SELL1',
              totalAmount: 50,
              currency: 'USD',
              charges: [{ type: 'Service', code: 'VIPD', amount: 50, currency: 'USD' }],
            },
          ],
        },
      };

      const apiBooking: Partial<ApiBooking> = {
        journeys: [],
        pax: [],
        payments: [],
        contacts: [],
        services: [],
        etickets: [],
        pricing: apiPricing as any,
        bookingInfo: {
          referenceId: 'ABC',
          recordLocator: 'LOC',
          status: 'Confirmed',
          createdDate: new Date(),
          pointOfSale: {},
        } as any,
      };

      journeyMapperMock.map.and.returnValue({} as any);

      const result = service.map(apiBooking as ApiBooking);

      // Verify that PerPaxSegment was correctly mapped to perPaxSegment
      const perPaxSegmentBreakdown = result.pricing.breakdown[BreakdownKeys.PER_PAX_SEGMENT];
      expect(perPaxSegmentBreakdown).toBeDefined();
      expect(Array.isArray(perPaxSegmentBreakdown)).toBeTrue();
      expect(perPaxSegmentBreakdown.length).toBe(1);
      
      const firstSegment = perPaxSegmentBreakdown[0];
      expect(firstSegment).toBeDefined();
      expect(firstSegment.segmentId).toBe('SEG1');
    });
  });
});
