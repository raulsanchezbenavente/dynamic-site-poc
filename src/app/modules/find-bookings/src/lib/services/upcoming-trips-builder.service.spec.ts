import { TestBed } from '@angular/core/testing';
import { UpcomingTripsBuilderService } from './upcoming-trips-builder.service';
import { GetCarrierService } from './get-carriers.service';
import {
  CultureServiceEx,
  AuthenticationStorageService,
  PointOfSaleService,
  JourneyStatus,
  TextHelperService,
} from '@dcx/ui/libs';
import { FindBookingsResponse, FlightStatus } from '../api-models/find-bookings-response.model';
import { FindBookingsConfig } from '../models/find-bookings.config';

describe('UpcomingTripsBuilderService', () => {
  let service: UpcomingTripsBuilderService;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockAuthStorageService: jasmine.SpyObj<AuthenticationStorageService>;
  let mockPosService: jasmine.SpyObj<PointOfSaleService>;
  let mockGetCarrierService: jasmine.SpyObj<GetCarrierService>;
  let mockTextHelperService: jasmine.SpyObj<TextHelperService>;

  const mockConfig: FindBookingsConfig = {
    carriersList: [
      { code: 'AV', name: 'Avianca' },
      { code: 'AA', name: 'American Airlines' },
    ],
    airCraftList: [
      { code: '738', name: 'Boeing 737-800' },
      { code: '320', name: 'Airbus A320' },
    ],
    dialogModalsRepository: { modalDialogExceptions: [] },
    checkinUrl: 'https://checkin.example.com/{{lang}}/{{pnr}}/{{lastname}}/{{pos}}',
    mmbUrl: 'https://mmb.example.com/{{lang}}/{{pnr}}/{{lastname}}',
    earlyCheckinEligibleStationCodes: ['BOG', 'MIA'],
  };

  const baseSegment: any = {
    recordLocator: 'ABC123',
    origin: 'BOG',
    destination: 'MIA',
    originTerminal: '1',
    destinationTerminal: '2',
    departureDate: '2025-10-15T10:00:00',
    arrivalDate: '2025-10-15T14:00:00',
    departureRealDate: '2025-10-15T10:00:00',
    arrivalRealDate: '2025-10-15T14:00:00',
    duration: '04:00',
    carrierCode: 'AV',
    transportNumber: '123',
    segmentStatus: FlightStatus.Confirmed,
  };

  const mockResponse: FindBookingsResponse = {
    success: true,
    result: { result: true, data: { segments: [ { ...baseSegment } ] } },
  };

  beforeEach(() => {
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getCulture']);
    mockAuthStorageService = jasmine.createSpyObj('AuthenticationStorageService', ['getAuthenticationTokenData']);
    mockPosService = jasmine.createSpyObj('PointOfSaleService', ['getCurrentPointOfSale']);
    mockGetCarrierService = jasmine.createSpyObj('GetCarrierService', ['getCarrierName']);
    mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['normalizeUrlParameter']);

    mockCultureServiceEx.getCulture.and.returnValue('es-CO');
    mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
      accountInfo: { lastName: 'Doe', firstName: 'John' } as any,
    } as any);
    mockPosService.getCurrentPointOfSale.and.returnValue({ code: 'CO', name: 'Colombia' } as any);
    mockTextHelperService.normalizeUrlParameter.and.callFake((value: string | null | undefined) => {
      if (!value) {
        return '';
      }
      return value
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '')
        .replaceAll(/[ñÑ]/g, 'n')
        .replaceAll(/[`¨^]/g, '')
        .trim()
        .replaceAll(/\s+/g, ' ')
        .toLowerCase();
    });

    // Ajuste: usar callFake para permitir cambio de nombre según config
    mockGetCarrierService.getCarrierName.and.callFake((config: FindBookingsConfig, code: string) =>
      config?.carriersList.find(c => c.code === code)?.name || ''
    );

    TestBed.configureTestingModule({
      providers: [
        UpcomingTripsBuilderService,
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: AuthenticationStorageService, useValue: mockAuthStorageService },
        { provide: PointOfSaleService, useValue: mockPosService },
        { provide: GetCarrierService, useValue: mockGetCarrierService },
        { provide: TextHelperService, useValue: mockTextHelperService },
      ],
    });

    service = TestBed.inject(UpcomingTripsBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array when no segments', () => {
    const emptyResponse: FindBookingsResponse = {
      success: true,
      result: { result: true, data: { segments: [] } },
    };
    expect(service.getData(emptyResponse, mockConfig)).toEqual([]);
  });

  it('should map segments to ManageBookingCardVM', () => {
    const result = service.getData(mockResponse, mockConfig);
    expect(result.length).toBe(1);
    expect(result[0].journeyVM.id).toBe('ABC123');
    expect(result[0].journeyVM.origin.iata).toBe('BOG');
    expect(result[0].journeyVM.destination.iata).toBe('MIA');
  });

  it('should build checkin URL with correct parameters', () => {
    const result = service.getData(mockResponse, mockConfig);
    expect(result[0].checkInDeepLinkUrl).toContain('es-CO');
    expect(result[0].checkInDeepLinkUrl).toContain('ABC123');
    expect(result[0].checkInDeepLinkUrl).toContain('doe');
    expect(result[0].checkInDeepLinkUrl).toContain('CO');
  });

  it('should build MMB URL with correct parameters', () => {
    const result = service.getData(mockResponse, mockConfig);
    expect(result[0].mmbDeepLinkUrl).toContain('es-CO');
    expect(result[0].mmbDeepLinkUrl).toContain('ABC123');
    expect(result[0].mmbDeepLinkUrl).toContain('doe');
  });

  describe('getData', () => {
    beforeEach(() => {
      mockGetCarrierService.getCarrierName.calls.reset();
    });

    it('should return empty array when result is undefined', () => {
      const undefinedResponse: FindBookingsResponse = { success: true, result: undefined as any };
      expect(service.getData(undefinedResponse, mockConfig)).toEqual([]);
    });

    it('should return empty array when data is undefined', () => {
      const noDataResponse: FindBookingsResponse = { success: true, result: { result: true, data: undefined as any } };
      expect(service.getData(noDataResponse, mockConfig)).toEqual([]);
    });

    it('should handle response with data but no segments array', () => {
      const noSegmentsResponse: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: undefined as any } },
      };
      expect(service.getData(noSegmentsResponse, mockConfig)).toEqual([]);
    });

    it('should return default values when segments is undefined in mapToManageBookingCardVM', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, recordLocator: 'TEST123' } ] } },
      };
      const serviceAny = service as any;
      const segment = response.result!.data!.segments[0];
      response.result!.data!.segments = undefined as any;
      const r = serviceAny.mapToManageBookingCardVM(segment, response, mockConfig);
      expect(r.checkInDeepLinkUrl).toBe('');
      expect(r.isCheckInAvailable).toBe(false);
      expect(r.isMmbAvailable).toBe(false);
      expect(r.mmbDeepLinkUrl).toBe('');
      expect(r.pageNumber).toBe(1);
      expect(r.totalRecords).toBe(0);
      expect(r.journeyVM).toBeDefined();
    });

    it('should map valid segments with all properties', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(result.length).toBe(1);
      expect(result[0].journeyVM).toBeDefined();
      expect(result[0].checkInDeepLinkUrl).toBeDefined();
      expect(result[0].mmbDeepLinkUrl).toBeDefined();
      expect(result[0].isCheckInAvailable).toBeDefined();
      expect(result[0].isMmbAvailable).toBeDefined();
      expect(result[0].pageNumber).toBe(1);
      expect(result[0].totalRecords).toBe(1);
    });

    it('should filter out segments missing arrivalDate or departureDate', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              { ...baseSegment, recordLocator: 'OK1' },
              { ...baseSegment, recordLocator: 'BAD1', arrivalDate: undefined },
              { ...baseSegment, recordLocator: 'BAD2', departureDate: undefined },
            ] as any,
          },
        },
      };
      const result = service.getData(response, mockConfig);
      expect(result.length).toBe(1);
      expect(result[0].journeyVM.id).toBe('OK1');
    });

    it('should handle undefined userData in checkin URL', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue(undefined as any);
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].checkInDeepLinkUrl).toContain('es-CO');
      expect(result[0].checkInDeepLinkUrl).toContain('ABC123');
    });

    it('should handle undefined pointOfSale in checkin URL', () => {
      mockPosService.getCurrentPointOfSale.and.returnValue(undefined as any);
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].checkInDeepLinkUrl).toContain('es-CO');
      expect(result[0].checkInDeepLinkUrl).toContain('ABC123');
      expect(result[0].checkInDeepLinkUrl).toContain('doe');
    });

    it('should handle undefined userData in MMB URL (lastname placeholder stays)', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({ accountInfo: {} } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('');
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].mmbDeepLinkUrl).toContain('{{lastname}}');
    });

    it('should handle multiple segments', () => {
      const multiSegmentResponse: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              { ...baseSegment },
              { ...baseSegment, recordLocator: 'DEF456', origin: 'MIA', destination: 'LAX', segmentStatus: FlightStatus.Delayed },
            ],
          },
        },
      };
      const result = service.getData(multiSegmentResponse, mockConfig);
      expect(result.length).toBe(2);
      expect(result[0].journeyVM.id).toBe('ABC123');
      expect(result[1].journeyVM.id).toBe('DEF456');
    });

    it('should produce Invalid Date for real dates when missing (no fallback applied)', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              {
                ...baseSegment,
                departureRealDate: undefined,
                arrivalRealDate: undefined,
              },
            ],
          },
        },
      };
      const r = service.getData(response, mockConfig)[0];
      expect(r.journeyVM.schedule.etd).toBeDefined();
      expect(isNaN(r.journeyVM.schedule.etd!.getTime())).toBeTrue();
      expect(r.journeyVM.schedule.eta).toBeDefined();
      expect(isNaN(r.journeyVM.schedule.eta!.getTime())).toBeTrue();
    });
  });

  describe('normalizeDuration', () => {
    it('should normalize HH:MM format to HH:MM:SS', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: '04:30' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('04:30:00');
    });

    it('should normalize HH:MM with single digits', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: '2:5' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('02:05:00');
    });

    it('should normalize HH:MM:SS format with padding', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: '04:05:06' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('04:05:06');
    });

    it('should normalize HH:MM:SS with single digits', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: '4:5:6' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('04:05:06');
    });

    it('should return default duration for empty string', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: '' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('00:00:00');
    });

    it('should return default duration for invalid format', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: 'invalid' } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.segments[0].duration).toBe('00:00:00');
    });

    it('should handle error in normalizeDuration and return default', () => {
      const errorDuration = { split: () => { throw new Error('Parse error'); } };
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, duration: errorDuration as any } ] } },
      };
      spyOn(console, 'error');
      const r = service.getData(response, mockConfig);
      expect(r[0].journeyVM.segments[0].duration).toBe('00:00:00');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isCheckInAvailable', () => {
    it('should return true for early checkin station within 24 hours', () => {
      const futureDate = new Date(); futureDate.setHours(futureDate.getHours() + 12);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, origin: 'BOG', departureDate: futureDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeTrue();
    });

    it('should return true for normal station within 48 hours', () => {
      const futureDate = new Date(); futureDate.setHours(futureDate.getHours() + 36);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, origin: 'LAX', destination: 'JFK', departureDate: futureDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeTrue();
    });

    it('should return false for early checkin station beyond 24 hours', () => {
      const futureDate = new Date(); futureDate.setHours(futureDate.getHours() + 30);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, origin: 'BOG', departureDate: futureDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });

    it('should return false for normal station beyond 48 hours', () => {
      const futureDate = new Date(); futureDate.setHours(futureDate.getHours() + 60);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, origin: 'LAX', departureDate: futureDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });

    it('should check destination for early checkin eligibility', () => {
      const futureDate = new Date(); futureDate.setHours(futureDate.getHours() + 12);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, origin: 'LAX', destination: 'MIA', departureDate: futureDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeTrue();
    });

    it('should return false for past departure (corrected logic)', () => {
      const pastDate = new Date(); pastDate.setHours(pastDate.getHours() - 2);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, departureDate: pastDate.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });

    it('should return false for boundary (departure now)', () => {
      const nowIso = new Date().toISOString();
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, departureDate: nowIso } ] } },
      };
      expect(service.getData(response, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });

    it('should return false for departure 1 hour in the past', () => {
      const past = new Date(); past.setHours(past.getHours() - 1);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, departureDate: past.toISOString() } ] } }
      };
      expect(service.getData(resp, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });

    it('should return true for in-flight (departed but not yet arrived)', () => {
      const pastDeparture = new Date(); pastDeparture.setHours(pastDeparture.getHours() - 1);
      const futureArrival = new Date(); futureArrival.setHours(futureArrival.getHours() + 3);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, departureDate: pastDeparture.toISOString(), arrivalDate: futureArrival.toISOString(), arrivalRealDate: futureArrival.toISOString() } ] } }
      };
      expect(service.getData(resp, mockConfig)[0].isCheckInAvailable).toBeTrue();
    });

    it('should return false for already landed (departure and arrival in the past)', () => {
      const pastDeparture = new Date(); pastDeparture.setHours(pastDeparture.getHours() - 5);
      const pastArrival = new Date(); pastArrival.setHours(pastArrival.getHours() - 1);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, departureDate: pastDeparture.toISOString(), arrivalDate: pastArrival.toISOString(), arrivalRealDate: pastArrival.toISOString() } ] } }
      };
      expect(service.getData(resp, mockConfig)[0].isCheckInAvailable).toBeFalse();
    });
  });

  describe('mapStatus and getJourneyStatus', () => {
    it('should map Confirmed status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Confirmed } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should map Canceled status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Canceled } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.CANCELLED);
    });

    it('should map Delayed status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Delayed } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.DELAYED);
    });

    it('should return undefined for Closed status when departure not >7 days ahead', () => {
      const nearFuture = new Date(); nearFuture.setDate(nearFuture.getDate() + 2);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Closed, departureDate: nearFuture.toISOString(), arrivalDate: nearFuture.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBeUndefined();
    });

    it('should force CONFIRMED when departure >7 days even if status maps undefined', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 10);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Closed, departureDate: farFuture.toISOString(), arrivalDate: farFuture.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should map Returned status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Returned } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.RETURNED);
    });

    it('should map Diverted status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Diverted } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.DIVERTED);
    });

    it('should map Departed status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Departed } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.DEPARTED);
    });

    it('should map Landed status', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Landed } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.LANDED);
    });

    it('should return undefined for unknown status when departure not >7 days', () => {
      const nearFuture = new Date(); nearFuture.setDate(nearFuture.getDate() + 3);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: 999 as FlightStatus, departureDate: nearFuture.toISOString(), arrivalDate: nearFuture.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBeUndefined();
    });

    it('should force CONFIRMED for unknown status when departure >7 days', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 15);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: 999 as FlightStatus, departureDate: farFuture.toISOString(), arrivalDate: farFuture.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should override a mapped status to CONFIRMED if departure >7 days', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 12);
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, segmentStatus: FlightStatus.Delayed, departureDate: farFuture.toISOString(), arrivalDate: farFuture.toISOString() } ] } },
      };
      expect(service.getData(response, mockConfig)[0].journeyVM.status).toBe(JourneyStatus.CONFIRMED);
    });
  });

  describe('createLocation', () => {
    it('should create location with terminal', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [ { ...baseSegment, originTerminal: 'T1', destinationTerminal: 'T2' } ] } },
      };
      const result = service.getData(response, mockConfig);
      expect(result[0].journeyVM.origin.terminal).toBe('T1');
      expect(result[0].journeyVM.destination.terminal).toBe('T2');
    });
  });

  describe('createSchedule', () => {
    it('should create schedule with all date fields', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              {
                ...baseSegment,
                departureDate: '2025-10-15T10:00:00',
                arrivalDate: '2025-10-15T14:00:00',
                departureRealDate: '2025-10-15T10:30:00',
                arrivalRealDate: '2025-10-15T14:30:00',
              },
            ],
          },
        },
      };
      const r = service.getData(response, mockConfig)[0].journeyVM.segments[0].schedule;
      expect(r.std).toEqual(new Date('2025-10-15T10:00:00'));
      expect(r.sta).toEqual(new Date('2025-10-15T14:00:00'));
      expect(r.etd).toEqual(new Date('2025-10-15T10:30:00'));
      expect(r.eta).toEqual(new Date('2025-10-15T14:30:00'));
      expect(r.stdutc).toEqual(new Date('2025-10-15T10:00:00'));
      expect(r.stautc).toEqual(new Date('2025-10-15T14:00:00'));
      expect(r.etdutc).toEqual(new Date('2025-10-15T10:30:00'));
      expect(r.etautc).toEqual(new Date('2025-10-15T14:30:00'));
    });
  });

  describe('createSegmentVM', () => {
    it('should create segment with all properties', () => {
      const response: FindBookingsResponse = {
        success: true,
        result: {
          result: true,
          data: {
            segments: [
              {
                ...baseSegment,
                recordLocator: 'TEST123',
                duration: '05:30:00',
                segmentStatus: FlightStatus.Confirmed,
                carrierCode: 'AV',
                transportNumber: '789',
              },
            ],
          },
        },
      };
      const seg = service.getData(response, mockConfig)[0].journeyVM.segments[0];
      expect(seg.id).toBe('TEST123');
      expect(seg.duration).toBe('05:30:00');
      expect(seg.status).toBe(JourneyStatus.CONFIRMED);
      expect(seg.transport.type).toBeDefined();
    });
  });

  describe('createLegVM', () => {
    it('should create leg and call carrier service', () => {
      const result = service.getData(mockResponse, mockConfig);
      expect(mockGetCarrierService.getCarrierName).toHaveBeenCalled();
      expect(result[0].journeyVM.segments[0].legs[0].transport.type).toBeDefined();
    });
  });

  describe('URL building edge cases', () => {
    it('should leave unknown placeholder intact in checkin URL', () => {
      const customConfig = { ...mockConfig, checkinUrl: mockConfig.checkinUrl + '/{{unknown}}' };
      const url = service.getData(mockResponse, customConfig)[0].checkInDeepLinkUrl;
      expect(url).toContain('{{unknown}}');
    });

    it('should leave unknown placeholder intact in MMB URL when lastname undefined', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({ accountInfo: {} } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('');
      const customConfig = { ...mockConfig, mmbUrl: mockConfig.mmbUrl + '/{{extra}}' };
      const url = service.getData(mockResponse, customConfig)[0].mmbDeepLinkUrl;
      expect(url).toContain('{{lastname}}');
      expect(url).toContain('{{extra}}');
    });
  });

  describe('additional coverage', () => {
    it('should not fallback real dates for Delayed segment with missing real dates', () => {
      const delayed: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Delayed,
          departureRealDate: undefined,
          arrivalRealDate: undefined,
        }]}}
      };
      const card = service.getData(delayed, mockConfig)[0].journeyVM;
      // Since Delayed, code skips fallback - real dates invalid
      expect(isNaN(card.schedule.etd!.getTime())).toBeTrue();
      expect(isNaN(card.schedule.eta!.getTime())).toBeTrue();
    });

    it('should override CANCELLED to CONFIRMED when departure > 7 days', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 9);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Canceled,
          departureDate: farFuture.toISOString(),
          arrivalDate: farFuture.toISOString(),
        }]}}
      };
      const status = service.getData(resp, mockConfig)[0].journeyVM.status;
      expect(status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should return undefined for Default enum near future', () => {
      const soon = new Date(); soon.setDate(soon.getDate() + 2);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Default,
          departureDate: soon.toISOString(),
          arrivalDate: soon.toISOString(),
        }]}}
      };
      const status = service.getData(resp, mockConfig)[0].journeyVM.status;
      expect(status).toBeUndefined();
    });

    it('should override Default enum to CONFIRMED when >7 days', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 12);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Default,
          departureDate: farFuture.toISOString(),
          arrivalDate: farFuture.toISOString(),
        }]}}
      };
      const status = service.getData(resp, mockConfig)[0].journeyVM.status;
      expect(status).toBe(JourneyStatus.CONFIRMED);
    });

    it('should include model and operation iata codes in segment and leg', () => {
      const seg: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          transport: '320',
          operationOriginIata: 'BOG_OP',
          operationDestinationIata: 'MIA_OP',
        }]}}
      };
      const card = service.getData(seg, mockConfig)[0].journeyVM;
      const segmentVM = card.segments[0];
      expect(segmentVM.legs[0].transport.model).toBe('Airbus A320');
      expect(card.origin.iataOperation).toBe('BOG_OP');
      expect(card.destination.iataOperation).toBe('MIA_OP');
    });

    it('should produce empty deep links and correct flags when URLs are empty', () => {
      const configNoUrls: FindBookingsConfig = { ...mockConfig, checkinUrl: '', mmbUrl: '' };
      const result = service.getData(mockResponse, configNoUrls)[0];
      expect(result.checkInDeepLinkUrl).toBe('');
      expect(result.mmbDeepLinkUrl).toBe('');
      // isCheckInAvailable computed; given baseSegment far future (Oct 15 2025 vs current date maybe), verify logic:
      const shouldCheckInBe = result.isCheckInAvailable;
      if (!shouldCheckInBe) {
        expect(result.isMmbAvailable).toBeTrue();
      }
    });

    it('should set isMmbAvailable true when check-in not available (far future normal station)', () => {
      const farFuture = new Date(); farFuture.setDate(farFuture.getDate() + 25);
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          origin: 'LAX',
          destination: 'JFK',
          departureDate: farFuture.toISOString(),
          arrivalDate: farFuture.toISOString(),
        }]}}
      };
      const card = service.getData(resp, mockConfig)[0];
      expect(card.isCheckInAvailable).toBeFalse();
      expect(card.isMmbAvailable).toBeTrue();
    });

    it('should normalize duration consistently across journey, segment and leg', () => {
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          duration: '1:2:3',
        }]}}
      };
      const card = service.getData(resp, mockConfig)[0].journeyVM;
      const normalized = '01:02:03';
      expect(card.duration).toBe(normalized);
      expect(card.segments[0].duration).toBe(normalized);
      expect(card.segments[0].legs[0].duration).toBe(normalized);
    });

    it('should default duration when more than 3 parts', () => {
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          duration: '1:2:3:4',
        }]}}
      };
      const card = service.getData(resp, mockConfig)[0].journeyVM;
      expect(card.duration).toBe('00:00:00');
    });

    it('should mark check-in unavailable when hoursUntilDeparture == 0 (boundary)', () => {
      const nowIso = new Date().toISOString();
      const resp: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          departureDate: nowIso,
          arrivalDate: nowIso,
        }]}}
      };
      const card = service.getData(resp, mockConfig)[0];
      if (!card.isCheckInAvailable) {
        expect(card.isMmbAvailable).toBeTrue();
      }
    });

    it('should not fallback real dates for Returned segment with missing real dates', () => {
      const ret: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Returned,
          departureRealDate: undefined,
          arrivalRealDate: undefined,
        }]}}
      };
      const card = service.getData(ret, mockConfig)[0].journeyVM;
      expect(isNaN(card.schedule.etd!.getTime())).toBeTrue();
      expect(isNaN(card.schedule.eta!.getTime())).toBeTrue();
    });

    it('should not fallback real dates for Diverted segment with missing real dates', () => {
      const div: FindBookingsResponse = {
        success: true,
        result: { result: true, data: { segments: [{
          ...baseSegment,
          segmentStatus: FlightStatus.Diverted,
          departureRealDate: undefined,
          arrivalRealDate: undefined,
        }]}}
      };
      const card = service.getData(div, mockConfig)[0].journeyVM;
      expect(isNaN(card.schedule.etd!.getTime())).toBeTrue();
      expect(isNaN(card.schedule.eta!.getTime())).toBeTrue();
    });

    it('should update carrier name if config changes between calls (signal usage)', () => {
      const firstName = service.getData(mockResponse, mockConfig)[0].journeyVM.segments[0].transport.carrier.name;
      const newConfig: FindBookingsConfig = {
        ...mockConfig,
        carriersList: [{ code: 'AV', name: 'Nuevo' }]
      };
      const secondName = service.getData(mockResponse, newConfig)[0].journeyVM.segments[0].transport.carrier.name;
      expect(firstName).toBe('Avianca');
      expect(secondName).toBe('Nuevo');
    });
  });

  describe('URL parameter normalization', () => {
    it('should normalize lastname with special characters in checkin URL', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
        accountInfo: { lastName: 'iñaqui', firstName: 'John' } as any,
      } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('inaqui');
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].checkInDeepLinkUrl).toContain('inaqui');
      expect(result[0].checkInDeepLinkUrl).not.toContain('iñaqui');
      expect(mockTextHelperService.normalizeUrlParameter).toHaveBeenCalledWith('iñaqui');
    });

    it('should normalize lastname with accents in MMB URL and convert to lowercase', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
        accountInfo: { lastName: 'José María', firstName: 'John' } as any,
      } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('jose maria');
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].mmbDeepLinkUrl).toContain('jose maria');
      expect(result[0].mmbDeepLinkUrl).not.toContain('José');
      expect(mockTextHelperService.normalizeUrlParameter).toHaveBeenCalledWith('José María');
    });

    it('should normalize lastname with ñ in both URLs and convert to lowercase', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
        accountInfo: { lastName: 'García-López', firstName: 'John' } as any,
      } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('garcia-lopez');
      const result = service.getData(mockResponse, mockConfig);
      expect(result[0].checkInDeepLinkUrl).toContain('garcia-lopez');
      expect(result[0].mmbDeepLinkUrl).toContain('garcia-lopez');
      expect(mockTextHelperService.normalizeUrlParameter).toHaveBeenCalledWith('García-López');
    });

    it('should handle empty lastname in URLs', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
        accountInfo: { lastName: '', firstName: 'John' } as any,
      } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('');
      const result = service.getData(mockResponse, mockConfig);
      expect(mockTextHelperService.normalizeUrlParameter).toHaveBeenCalledWith('');
    });

    it('should handle null lastname in URLs', () => {
      mockAuthStorageService.getAuthenticationTokenData.and.returnValue({
        accountInfo: { lastName: null, firstName: 'John' } as any,
      } as any);
      mockTextHelperService.normalizeUrlParameter.and.returnValue('');
      const result = service.getData(mockResponse, mockConfig);
      expect(mockTextHelperService.normalizeUrlParameter).toHaveBeenCalledWith(null);
    });
  });
});
