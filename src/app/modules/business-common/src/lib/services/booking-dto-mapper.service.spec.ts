import { TestBed } from '@angular/core/testing';
import {
  Booking as BookingDto,
  BookingInfo as BookingInfoDto,
  BookingPricing,
  Bundle as BundleDto,
  Contact,
  Eticket as EticketDto,
  Journey,
  Leg,
  Pax,
  Payment as PaymentDto,
  Segment,
  Service as ServiceDto,
} from '@dcx/ui/api-layer';
import { JourneyType, PaxTypeCode, Transport, TripType } from '@dcx/ui/libs';

import { BreakdownKeys } from '../components/summary-cart/models/breakdown-keys.const';
import { BreakdownFields } from '../enums/breakdown-fields.enum';
import { BookingDtoMapperService } from './booking-dto-mapper.service';

describe('BookingDtoMapperService', () => {
  let service: BookingDtoMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingDtoMapperService],
    });
    service = TestBed.inject(BookingDtoMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapBooking', () => {
    it('should map a complete booking DTO to booking model', () => {
      const mockBookingDto: BookingDto = createMockBookingDto();

      const result = service.mapBooking(mockBookingDto);

      expect(result).toBeDefined();
      expect(result.bookingInfo).toBeDefined();
      expect(result.pax).toBeDefined();
      expect(result.journeys).toBeDefined();
      expect(result.payments).toBeDefined();
      expect(result.contacts).toBeDefined();
      expect(result.pricing).toBeDefined();
      expect(result.services).toBeDefined();
      expect(result.bundles).toBeDefined();
      expect(result.etickets).toBeDefined();
      expect(result.hasDisruptions).toBe(false);
      expect(result.bookingFees).toEqual([]);
    });

    it('should handle booking with disruptions', () => {
      const mockBookingDto: BookingDto = createMockBookingDto();
      mockBookingDto.hasDisruptions = true;

      const result = service.mapBooking(mockBookingDto);

      expect(result.hasDisruptions).toBe(true);
    });
  });

  describe('mapBookingInfo', () => {
    it('should map booking info with date as string', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.bookingInfo.createdDate = '2026-01-19T10:00:00Z' as any;

      const result = service.mapBooking(mockDto);

      expect(result.bookingInfo.createdDate).toBe('2026-01-19T10:00:00Z');
      expect(result.bookingInfo.recordLocator).toBe('ABC123');
      expect(result.bookingInfo.status).toBe('confirmed');
    });

    it('should map booking info with date as Date object', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const testDate = new Date('2026-01-19T10:00:00Z');
      mockDto.bookingInfo.createdDate = testDate;

      const result = service.mapBooking(mockDto);

      expect(result.bookingInfo.createdDate).toBe(testDate.toISOString());
    });

    it('should map booking info with comments and queues', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.bookingInfo.comments = [{ data: 'Test comment' }] as any;
      mockDto.bookingInfo.queues = [
        {
          code: 'Q1',
          queuedDate: new Date('2026-01-19T10:00:00Z'),
        },
      ] as any;

      const result = service.mapBooking(mockDto);

      expect(result.bookingInfo.comments).toHaveSize(1);
      expect(result.bookingInfo.comments[0].data).toBe('Test comment');
      expect(result.bookingInfo.queues).toHaveSize(1);
      expect(result.bookingInfo.queues[0].code).toBe('Q1');
    });

    it('should map booking info with trip type', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.bookingInfo.tripType = 1 as any;

      const result = service.mapBooking(mockDto);

      expect(result.bookingInfo.tripType).toBe(1 as any);
    });
  });

  describe('mapPax', () => {
    it('should map passengers array', () => {
      const mockDto: BookingDto = createMockBookingDto();

      const result = service.mapBooking(mockDto);

      expect(result.pax).toHaveSize(1);
      expect(result.pax[0].id).toBe('pax-1');
      expect(result.pax[0].name.first).toBe('John');
      expect(result.pax[0].name.last).toBe('Doe');
      expect(result.pax[0].type.code).toBe('ADT');
    });

    it('should map passenger with channels', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.pax[0].channels = [
        {
          type: 'email',
          info: 'john@example.com',
          prefix: '',
          cultureCode: 'en',
          scope: 1 as any,
          additionalData: '' as any,
        },
      ];

      const result = service.mapBooking(mockDto);

      expect(result.pax[0].channels).toHaveSize(1);
      expect(result.pax[0].channels![0].type).toBe('email');
      expect(result.pax[0].channels![0].info).toBe('john@example.com');
    });

    it('should map empty pax array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.pax = [];

      const result = service.mapBooking(mockDto);

      expect(result.pax).toEqual([]);
    });
  });

  describe('mapJourneys', () => {
    it('should infer OUTBOUND journey type for single journey', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.journeys = [createMockJourney('MAD', 'BCN')];

      const result = service.mapBooking(mockDto);

      expect(result.journeys).toHaveSize(1);
      expect(result.journeys[0].journeyType).toBe(JourneyType.OUTBOUND);
    });

    it('should infer OUTBOUND and RETURN journey types for multiple journeys', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.journeys = [createMockJourney('MAD', 'BCN'), createMockJourney('BCN', 'MAD')];

      const result = service.mapBooking(mockDto);

      expect(result.journeys).toHaveSize(2);
      expect(result.journeys[0].journeyType).toBe(JourneyType.OUTBOUND);
      expect(result.journeys[1].journeyType).toBe(JourneyType.RETURN);
    });

    it('should map journey with origin and destination details', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      journey.originTerminal = 'T4';
      journey.destinationTerminal = 'T1';
      journey.originCountry = 'ES';
      journey.destinationCountry = 'ES';
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].origin.iata).toBe('MAD');
      expect(result.journeys[0].origin.terminal).toBe('T4');
      expect(result.journeys[0].origin.country).toBe('ES');
      expect(result.journeys[0].destination.iata).toBe('BCN');
      expect(result.journeys[0].destination.terminal).toBe('T1');
      expect(result.journeys[0].destination.country).toBe('ES');
    });

    it('should map journey with schedule information', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      journey.std = new Date('2026-01-19T10:00:00Z');
      journey.stdutc = new Date('2026-01-19T10:00:00Z');
      journey.sta = new Date('2026-01-19T12:00:00Z');
      journey.stautc = new Date('2026-01-19T12:00:00Z');
      journey.duration = '02:00';
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].schedule.std).toEqual(new Date('2026-01-19T10:00:00Z'));
      expect(result.journeys[0].schedule.sta).toEqual(new Date('2026-01-19T12:00:00Z'));
      expect(result.journeys[0].duration).toBe('02:00');
    });

    it('should map journey with check-in info', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      journey.openingCheckInDate = new Date('2026-01-18T10:00:00Z');
      journey.closingCheckInDate = new Date('2026-01-19T09:00:00Z');
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].checkinInfo?.openingCheckInDate).toEqual(new Date('2026-01-18T10:00:00Z'));
      expect(result.journeys[0].checkinInfo?.closingCheckInDate).toEqual(new Date('2026-01-19T09:00:00Z'));
    });
  });

  describe('mapSegments', () => {
    it('should map segments within a journey', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      journey.segments = [createMockSegment('MAD', 'BCN')];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments).toHaveSize(1);
      expect(result.journeys[0].segments[0].origin.iata).toBe('MAD');
      expect(result.journeys[0].segments[0].destination.iata).toBe('BCN');
    });

    it('should map segment with transport information', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.transport = { carrierCode: 'AA', flightNumber: '1234' } as any;
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].transport).toBeDefined();
    });
  });

  describe('mapLegs', () => {
    it('should map legs with calculated duration', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: new Date('2026-01-19T10:00:00Z'),
          stdutc: new Date('2026-01-19T10:00:00Z'),
          sta: new Date('2026-01-19T12:30:00Z'),
          stautc: new Date('2026-01-19T12:30:00Z'),
        } as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs).toHaveSize(1);
      expect(result.journeys[0].segments[0].legs[0].duration).toBe('02:30');
    });

    it('should inherit transport from segment', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      const transport = { carrierCode: 'AA', flightNumber: '1234' } as any;
      segment.transport = transport;
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: new Date('2026-01-19T10:00:00Z'),
          stdutc: new Date('2026-01-19T10:00:00Z'),
          sta: new Date('2026-01-19T12:00:00Z'),
          stautc: new Date('2026-01-19T12:00:00Z'),
        } as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs[0].transport).toBe(transport);
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration correctly for valid dates', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: new Date('2026-01-19T10:00:00Z'),
          stdutc: new Date('2026-01-19T10:00:00Z'),
          sta: new Date('2026-01-19T12:00:00Z'),
          stautc: new Date('2026-01-19T12:00:00Z'),
        } as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs[0].duration).toBe('02:00');
    });

    it('should return 00:00 for invalid dates', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: 'invalid-date',
          stdutc: 'invalid-date',
          sta: 'invalid-date',
          stautc: 'invalid-date',
        } as unknown as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs[0].duration).toBe('00:00');
    });

    it('should return 00:00 when arrival is before departure', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: new Date('2026-01-19T12:00:00Z'),
          stdutc: new Date('2026-01-19T12:00:00Z'),
          sta: new Date('2026-01-19T10:00:00Z'),
          stautc: new Date('2026-01-19T10:00:00Z'),
        } as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs[0].duration).toBe('00:00');
    });

    it('should format duration with leading zeros', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const journey = createMockJourney('MAD', 'BCN');
      const segment = createMockSegment('MAD', 'BCN');
      segment.legs = [
        {
          origin: 'MAD',
          destination: 'BCN',
          originCountry: 'ES',
          destinationCountry: 'ES',
          std: new Date('2026-01-19T10:00:00Z'),
          stdutc: new Date('2026-01-19T10:00:00Z'),
          sta: new Date('2026-01-19T10:45:00Z'),
          stautc: new Date('2026-01-19T10:45:00Z'),
        } as Leg,
      ];
      journey.segments = [segment];
      mockDto.journeys = [journey];

      const result = service.mapBooking(mockDto);

      expect(result.journeys[0].segments[0].legs[0].duration).toBe('00:45');
    });
  });

  describe('mapContacts', () => {
    it('should map contacts array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.contacts = [createMockContact()];

      const result = service.mapBooking(mockDto);

      expect(result.contacts).toHaveSize(1);
      expect(result.contacts[0].id).toBe('contact-1');
      expect(result.contacts[0].name.first).toBe('Jane');
    });

    it('should map contact with channels', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const contact = createMockContact();
      contact.channels = [
        {
          type: 'phone',
          info: '+34123456789',
          prefix: '+34',
          cultureCode: 'es',
          scope: 1 as any,
          additionalData: '' as any,
        },
      ];
      mockDto.contacts = [contact];

      const result = service.mapBooking(mockDto);

      expect(result.contacts[0].channels).toHaveSize(1);
      expect(result.contacts[0].channels[0].type).toBe('phone');
    });
  });

  describe('mapPricing', () => {
    it('should map pricing with breakdown', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.pricing = createMockPricing();

      const result = service.mapBooking(mockDto);

      expect(result.pricing.totalAmount).toBe(100);
      expect(result.pricing.balanceDue).toBe(0);
      expect(result.pricing.currency).toBe('EUR');
      expect(result.pricing.breakdown).toBeDefined();
    });

    it('should map empty breakdown categories', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const pricing = createMockPricing();
      pricing.breakdown = {
        [BreakdownKeys.PER_BOOKING]: [],
        [BreakdownKeys.PER_PAX]: [],
        [BreakdownKeys.PER_PAX_SEGMENT]: [],
        [BreakdownKeys.PER_SEGMENT]: [],
        [BreakdownKeys.PER_PAX_JOURNEY]: [],
      } as any;
      mockDto.pricing = pricing;

      const result = service.mapBooking(mockDto);

      expect(result.pricing.breakdown.perBooking).toEqual([]);
      expect(result.pricing.breakdown.perPax).toEqual([]);
      expect(result.pricing.breakdown.perPaxSegment).toEqual([]);
    });

    it('should map breakdown items with extra fields', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const pricing = createMockPricing();
      pricing.breakdown[BreakdownKeys.PER_PAX] = [
        {
          [BreakdownFields.PAX_ID]: 'pax-1',
          code: 'FARE',
          amount: 50,
          charges: [],
        } as any,
      ];
      mockDto.pricing = pricing;

      const result = service.mapBooking(mockDto);

      expect(result.pricing.breakdown.perPax).toHaveSize(1);
      expect((result.pricing.breakdown.perPax[0] as any)[BreakdownFields.PAX_ID]).toBe('pax-1');
    });

    it('should handle undefined breakdown categories', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const pricing = createMockPricing();
      pricing.breakdown = {
        [BreakdownKeys.PER_BOOKING]: undefined,
        [BreakdownKeys.PER_PAX]: undefined,
        [BreakdownKeys.PER_PAX_SEGMENT]: undefined,
        [BreakdownKeys.PER_SEGMENT]: undefined,
        [BreakdownKeys.PER_PAX_JOURNEY]: undefined,
      } as any;
      mockDto.pricing = pricing;

      const result = service.mapBooking(mockDto);

      expect(result.pricing.breakdown.perBooking).toEqual([]);
      expect(result.pricing.breakdown.perPax).toEqual([]);
    });
  });

  describe('mapPayments', () => {
    it('should map payments array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.payments = [createMockPayment()];

      const result = service.mapBooking(mockDto);

      expect(result.payments).toHaveSize(1);
      expect(result.payments[0].amount).toBe(100);
      expect(result.payments[0].currency).toBe('EUR');
    });

    it('should handle payment without id', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const payment = createMockPayment();
      payment.id = undefined;
      mockDto.payments = [payment];

      const result = service.mapBooking(mockDto);

      expect(result.payments[0].id).toBe('');
    });
  });

  describe('mapServices', () => {
    it('should map services array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.services = [createMockService()];

      const result = service.mapBooking(mockDto);

      expect(result.services).toHaveSize(1);
      expect(result.services[0].code).toBe('SEAT');
      expect(result.services[0].paxId).toBe('pax-1');
    });

    it('should map empty services array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.services = [];

      const result = service.mapBooking(mockDto);

      expect(result.services).toEqual([]);
    });
  });

  describe('mapBundles', () => {
    it('should map bundles array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.bundles = [createMockBundle()];

      const result = service.mapBooking(mockDto);

      expect(result.bundles).toHaveSize(1);
      expect(result.bundles![0].code).toBe('FLEX');
      expect(result.bundles![0].paxId).toBe('pax-1');
    });

    it('should map bundle with services', () => {
      const mockDto: BookingDto = createMockBookingDto();
      const bundle = createMockBundle();
      bundle.services = ['service-1', 'service-2'];
      mockDto.bundles = [bundle];

      const result = service.mapBooking(mockDto);

      expect(result.bundles![0].services).toEqual(['service-1', 'service-2']);
    });
  });

  describe('mapEtickets', () => {
    it('should map etickets array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.etickets = [createMockEticket()];

      const result = service.mapBooking(mockDto);

      expect(result.etickets).toHaveSize(1);
      expect(result.etickets![0].code).toBe('TICKET-001');
      expect(result.etickets![0].paxId).toBe('pax-1');
    });

    it('should map empty etickets array', () => {
      const mockDto: BookingDto = createMockBookingDto();
      mockDto.etickets = [];

      const result = service.mapBooking(mockDto);

      expect(result.etickets).toEqual([]);
    });
  });

  // Helper functions
  function createMockBookingDto(): BookingDto {
    return {
      id: 'booking-123',
      bookingInfo: {
        recordLocator: 'ABC123',
        createdDate: new Date('2026-01-19T10:00:00Z'),
        status: 'confirmed',
        comments: [],
        queues: [],
        pointOfSale: {
          agent: 'agent-1',
          organization: 'org-1',
          channelType: 1,
          posCode: 'MAD',
        },
        tripType: 0 as any,
        referenceId: 'ref-123',
        prospectId: '',
      } as any,
      pax: [
        {
          id: 'pax-1',
          type: {
            category: 'Adult',
            code: 'ADT' as unknown as PaxTypeCode,
          },
          name: {
            title: 'Mr',
            first: 'John',
            middle: '',
            last: 'Doe',
          },
          dependentPaxes: [],
          address: {},
          documents: [],
          personInfo: {},
          channels: [],
          segmentsInfo: [],
          status: 'confirmed',
          referenceId: 'pax-ref-1',
          loyaltyNumbers: [],
          customerId: '',
          purposeOfVisit: '',
        } as any,
      ],
      journeys: [createMockJourney('MAD', 'BCN')],
      payments: [],
      contacts: [],
      pricing: createMockPricing(),
      services: [],
      bundles: [],
      etickets: [],
      hasDisruptions: false,
    } as any;
  }

  function createMockJourney(origin: string, destination: string): Journey {
    return {
      id: 'journey-1',
      origin,
      destination,
      originTerminal: '',
      destinationTerminal: '',
      originCountry: 'ES',
      destinationCountry: 'ES',
      std: new Date('2026-01-19T10:00:00Z'),
      stdutc: new Date('2026-01-19T10:00:00Z'),
      sta: new Date('2026-01-19T12:00:00Z'),
      stautc: new Date('2026-01-19T12:00:00Z'),
      duration: '02:00',
      segments: [createMockSegment(origin, destination)],
      fares: [],
      status: 'confirmed',
      openingCheckInDate: undefined as any,
      closingCheckInDate: undefined as any,
      referenceId: 'journey-ref-1',
      hasDisruptions: false,
      disruptionItems: [],
    } as any;
  }

  function createMockSegment(origin: string, destination: string): Segment {
    return {
      id: 'segment-1',
      referenceId: 'seg-ref-1',
      origin,
      destination,
      originCountry: 'ES',
      destinationCountry: 'ES',
      std: new Date('2026-01-19T10:00:00Z'),
      stdutc: new Date('2026-01-19T10:00:00Z'),
      sta: new Date('2026-01-19T12:00:00Z'),
      stautc: new Date('2026-01-19T12:00:00Z'),
      duration: '02:00',
      transport: {} as any,
      legs: [],
      departureGate: '',
    } as any;
  }

  function createMockContact(): Contact {
    return {
      id: 'contact-1',
      type: 'primary',
      mktOption: true,
      personInfo: {},
      name: {
        title: 'Ms',
        first: 'Jane',
        middle: '',
        last: 'Smith',
      },
      address: {},
      channels: [],
      documents: [],
      billingInfo: {},
      paxReferenceId: 'pax-1',
      referenceId: 'contact-ref-1',
    } as any;
  }

  function createMockPricing(): BookingPricing {
    return {
      totalAmount: 100,
      balanceDue: 0,
      isBalanced: true,
      currency: 'EUR',
      breakdown: {
        [BreakdownKeys.PER_BOOKING]: [],
        [BreakdownKeys.PER_PAX]: [],
        [BreakdownKeys.PER_PAX_SEGMENT]: [],
        [BreakdownKeys.PER_SEGMENT]: [],
        [BreakdownKeys.PER_PAX_JOURNEY]: [],
      },
    } as any;
  }

  function createMockPayment(): PaymentDto {
    return {
      id: 'payment-1',
      paymentMethod: 'credit-card',
      paymentType: 'sale',
      currency: 'EUR',
      amount: 100,
      paymentDate: '2026-01-19T10:00:00Z' as any,
      status: 'approved',
      referenceId: 'pay-ref-1',
      accountNumberId: '****1234',
    } as any;
  }

  function createMockService(): ServiceDto {
    return {
      id: 'service-1',
      referenceId: 'serv-ref-1',
      code: 'SEAT',
      sellKey: 'key-1',
      paxId: 'pax-1',
      status: 'confirmed',
      type: 'seat',
      scope: 1,
      category: 'ancillary',
      note: '',
      source: 'booking',
      isChecked: false,
      BookingChangeStrategy: undefined,
      differentialId: '',
    } as any;
  }

  function createMockBundle(): BundleDto {
    return {
      referenceId: 'bundle-1',
      paxId: 'pax-1',
      code: 'FLEX',
      status: 'confirmed',
      scope: '1',
      sellKey: 'key-1',
      services: [],
    } as any;
  }

  function createMockEticket(): EticketDto {
    return {
      code: 'TICKET-001',
      paxId: 'pax-1',
      referenceId: 'ticket-ref-1',
      scope: 1,
      sellKey: 'key-1',
    } as any;
  }
});
