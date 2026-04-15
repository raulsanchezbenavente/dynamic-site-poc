import { TestBed } from '@angular/core/testing';
import { PastTripsBuilderService } from './past-trips-builder.service';
import { GetCarrierService } from './get-carriers.service';
import { FindBookingsResponse, FlightStatus } from '../api-models/find-bookings-response.model';
import { FindBookingsConfig } from '../models/find-bookings.config';
import { JourneyStatus } from '@dcx/ui/libs';

describe('PastTripsBuilderService', () => {
  let service: PastTripsBuilderService;
  let mockGetCarrierService: jasmine.SpyObj<GetCarrierService>;

  const mockConfig: FindBookingsConfig = {
    carriersList: [
      { code: 'AV', name: 'Avianca' },
      { code: 'AA', name: 'American Airlines' },
    ],
    airCraftList: [],
    dialogModalsRepository: { modalDialogExceptions: [] },
    checkinUrl: '',
    mmbUrl: '',
    earlyCheckinEligibleStationCodes: [],
  };

  const baseSegment: any = {
    recordLocator: 'ABC123',
    origin: 'BOG',
    destination: 'MIA',
    originTerminal: '1',
    destinationTerminal: '2',
    departureDate: '2025-09-01T10:00:00',
    arrivalDate: '2025-09-01T14:00:00',
    departureRealDate: '2025-09-01T10:00:00',
    arrivalRealDate: '2025-09-01T14:00:00',
    duration: '04:00',
    carrierCode: 'AV',
    transportNumber: '123',
    segmentStatus: FlightStatus.Confirmed,
  };

  const mockResponse: FindBookingsResponse = {
    success: true,
    result: { result: true, data: { segments: [{ ...baseSegment }] } },
  };

  beforeEach(() => {
    mockGetCarrierService = jasmine.createSpyObj('GetCarrierService', ['getCarrierName']);
    mockGetCarrierService.getCarrierName.and.callFake((config: FindBookingsConfig, code: string) => {
      return config.carriersList.find(c => c.code === code)?.name || '';
    });

    TestBed.configureTestingModule({
      providers: [
        PastTripsBuilderService,
        { provide: GetCarrierService, useValue: mockGetCarrierService },
      ],
    });

    service = TestBed.inject(PastTripsBuilderService);
  });

  afterEach(() => {
    mockGetCarrierService.getCarrierName.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getData', () => {
    it('should return empty array when no segments', () => {
      const emptyResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [] } },
      };
      expect(service.getData(emptyResponse, mockConfig)).toEqual([]);
    });

    it('should return empty array when segments is undefined', () => {
      const emptyResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: undefined as any } },
      };
      expect(service.getData(emptyResponse, mockConfig)).toEqual([]);
    });

    it('should return empty array when result is undefined', () => {
      const emptyResponse: FindBookingsResponse = {
        success: true,
        result: undefined as any,
      };
      expect(service.getData(emptyResponse, mockConfig)).toEqual([]);
    });

    it('should return empty array when data is undefined', () => {
      const emptyResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: undefined as any },
      };
      expect(service.getData(emptyResponse, mockConfig)).toEqual([]);
    });

    it('should ignore success flag and still map segments', () => {
      const response: FindBookingsResponse = {
        success: false,
        result: { result: true, data: { segments: [{ ...baseSegment }] } },
      };
      expect(service.getData(response, mockConfig).length).toBe(1);
    });

    it('should map segments to PastTripCardVM', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result.length).toBe(1);
      expect(result[0].origin.iata).toBe('BOG');
      expect(result[0].destination.iata).toBe('MIA');
      expect(result[0].totalRecords).toBe(1);
    });

    it('should create correct location data', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].origin).toEqual({ city: 'BOG', iata: 'BOG', country: '', terminal: '1' });
      expect(result[0].destination).toEqual({ city: 'MIA', iata: 'MIA', country: '', terminal: '2' });
    });

    it('should create correct schedule data', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].schedule.std).toEqual(new Date('2025-09-01T10:00:00'));
      expect(result[0].schedule.stdutc).toEqual(new Date('2025-09-01T10:00:00'));
      expect(result[0].schedule.sta).toEqual(new Date('2025-09-01T14:00:00'));
      expect(result[0].schedule.stautc).toEqual(new Date('2025-09-01T14:00:00'));
      expect(result[0].schedule.etd).toEqual(new Date('2025-09-01T10:00:00'));
      expect(result[0].schedule.etdutc).toEqual(new Date('2025-09-01T10:00:00'));
      expect(result[0].schedule.eta).toEqual(new Date('2025-09-01T14:00:00'));
      expect(result[0].schedule.etautc).toEqual(new Date('2025-09-01T14:00:00'));
    });

    it('should create segment with correct transport info', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].segments.length).toBe(1);
      expect(result[0].segments[0].id).toBe('ABC123');
      expect(result[0].segments[0].duration).toBe('04:00');
      expect(result[0].segments[0].transport.carrier.code).toBe('AV');
      expect(result[0].segments[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].segments[0].transport.number).toBe('123');
      expect(result[0].segments[0].status).toBe(JourneyStatus.CONFIRMED);
      expect(mockGetCarrierService.getCarrierName).toHaveBeenCalledWith(mockConfig, 'AV');
    });

    it('should sort segments by departure real date (most recent first) and set totalRecords only in first card', () => {
      const multipleSegmentsResponse: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              { ...baseSegment },
              {
                ...baseSegment,
                recordLocator: 'DEF456',
                origin: 'MIA',
                destination: 'BOG',
                originTerminal: '2',
                destinationTerminal: '1',
                departureDate: '2025-09-15T10:00:00',
                arrivalDate: '2025-09-15T14:00:00',
                departureRealDate: '2025-09-15T10:00:00',
                arrivalRealDate: '2025-09-15T14:00:00',
                transportNumber: '456',
              } as any,
            ],
          },
        },
      };
      const result = service.getData(multipleSegmentsResponse, mockConfig);
      expect(result.length).toBe(2);
      expect(result[0].segments[0].id).toBe('DEF456');
      expect(result[1].segments[0].id).toBe('ABC123');
      expect(result[0].totalRecords).toBe(2);
      expect(result[1].totalRecords).toBeUndefined();
    });

    it('should handle segment with legs correctly', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].segments[0].legs.length).toBe(1);
      expect(result[0].segments[0].legs[0].origin).toBe('BOG');
      expect(result[0].segments[0].legs[0].destination).toBe('MIA');
      expect(result[0].segments[0].legs[0].duration).toBe('04:00');
    });

    it('should call carrier service for both segment and leg transport', () => {
      mockGetCarrierService.getCarrierName.calls.reset();
      const result = service.getData(mockResponse, mockConfig);
      expect(mockGetCarrierService.getCarrierName).toHaveBeenCalledTimes(2);
      expect(result[0].segments[0].legs[0].transport.carrier.name).toBe('Avianca');
    });

    it('should set duration correctly in both segment and leg', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].segments[0].duration).toBe('04:00');
      expect(result[0].segments[0].legs[0].duration).toBe('04:00');
    });

    it('should set all schedule dates correctly in legs', () => {
      const result = service.getData(mockResponse, mockConfig);
      const leg = result[0].segments[0].legs[0];
      expect(leg.std).toEqual(new Date('2025-09-01T10:00:00'));
      expect(leg.sta).toEqual(new Date('2025-09-01T14:00:00'));
      expect(leg.etd).toEqual(new Date('2025-09-01T10:00:00'));
      expect(leg.eta).toEqual(new Date('2025-09-01T14:00:00'));
    });

    it('should not mutate original segment object', () => {
      const original = { ...baseSegment };
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [original] } },
      };
      service.getData(response, mockConfig);
      expect(original.recordLocator).toBe('ABC123');
      expect((original as any).totalRecords).toBeUndefined();
    });

    it('should keep invalid dates as Invalid Date objects when provided', () => {
      const invalidResponse: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [{
              ...baseSegment,
              departureDate: 'invalid',
              arrivalDate: 'invalid',
              departureRealDate: 'invalid',
              arrivalRealDate: 'invalid',
              recordLocator: 'BADDATE'
            }]
          }
        }
      };
      const r = service.getData(invalidResponse, mockConfig)[0];
      expect(isNaN(r.schedule.std.getTime())).toBeTrue();
      expect(isNaN(r.segments[0].schedule.std.getTime())).toBeTrue();
    });

    it('should update carrier name using new config across consecutive calls (signal updated)', () => {
      const first = service.getData(mockResponse, mockConfig);
      expect(first[0].segments[0].transport.carrier.name).toBe('Avianca');
      const newConfig: FindBookingsConfig = {
        ...mockConfig,
        carriersList: [{ code: 'AV', name: 'New Avianca' }]
      };
      const second = service.getData(mockResponse, newConfig);
      expect(second[0].segments[0].transport.carrier.name).toBe('New Avianca');
      expect(mockGetCarrierService.getCarrierName).toHaveBeenCalledTimes(4);
    });

    it('should propagate transport number to leg', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, transportNumber: '999' }] } },
      };
      const res = service.getData(response, mockConfig);
      expect(res[0].segments[0].transport.number).toBe('999');
      expect(res[0].segments[0].legs[0].transport.number).toBe('999');
    });

    it('should keep custom duration value intact', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, duration: '05:30:00' }] } },
      };
      const res = service.getData(response, mockConfig);
      expect(res[0].segments[0].duration).toBe('05:30:00');
      expect(res[0].segments[0].legs[0].duration).toBe('05:30:00');
    });
  });

  describe('mapStatus', () => {
    it('should map Confirmed', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].segments[0].status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should map Canceled', () => {
      const canceledResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Canceled }] } },
      };
      const result = service.getData(canceledResponse, mockConfig);
      expect(result[0].segments[0].status).toBe(JourneyStatus.CANCELLED);
    });

    it('should map Delayed', () => {
      const delayedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Delayed }] } },
      };
      const result = service.getData(delayedResponse, mockConfig);
      expect(result[0].segments[0].status).toBe(JourneyStatus.DELAYED);
    });

    it('should map Diverted', () => {
      const divertedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Diverted }] } },
      };
      const result = service.getData(divertedResponse, mockConfig);
      expect(result[0].segments[0].status).toBe(JourneyStatus.DIVERTED);
    });

    it('should return undefined for Closed', () => {
      const closedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Closed }] } },
      };
      const result = service.getData(closedResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });

    it('should return undefined for Returned', () => {
      const returnedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Returned }] } },
      };
      const result = service.getData(returnedResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });

    it('should return undefined for Landed', () => {
      const landedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Landed }] } },
      };
      const result = service.getData(landedResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });

    it('should return undefined for Departed', () => {
      const departedResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Departed }] } },
      };
      const result = service.getData(departedResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });

    it('should return undefined for Default (API)', () => {
      const defaultResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: FlightStatus.Default }] } },
      };
      const result = service.getData(defaultResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });

    it('should return undefined for unknown status', () => {
      const unknownStatusResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{ ...baseSegment, segmentStatus: 999 as FlightStatus }] } },
      };
      const result = service.getData(unknownStatusResponse, mockConfig);
      expect(result[0].segments[0].status).toBeUndefined();
    });
  });
});
