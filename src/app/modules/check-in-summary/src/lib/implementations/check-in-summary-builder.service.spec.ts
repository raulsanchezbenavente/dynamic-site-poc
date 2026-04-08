import { TestBed } from '@angular/core/testing';
import { PaxCategoryType, PaxSegmentCheckinStatus, SegmentCheckIn } from '@dcx/ui/api-layer';
import { Booking, dateHelper, JourneyType, JourneyVM, PaxSegmentsInfo, SegmentVM, TextHelperService, TimeMeasureModel } from '@dcx/ui/libs';

import { CheckInSummaryBuilderData } from '../models/check-in-summary-builder-data.model';
import { CheckInSummaryBuilderService } from './check-in-summary-builder.service';
import { CheckInSummaryJourneyVM, CheckInSummaryPassengerVM, JourneyEnricherService } from '@dcx/ui/business-common';

// Helper functions for creating mock data (hoisted to top-level for lint compliance)
function createMockJourney(): JourneyVM {
  return {
    id: 'journey-1',
    origin: { city: 'GIG', country: 'BR', terminal: 'T1', iata: 'GIG' },
    destination: { city: 'BOG', country: 'CO', terminal: 'T2', iata: 'BOG' },
    schedule: {
      std: new Date('2025-03-25T07:25:00'),
      stdutc: new Date('2025-03-25T10:25:00'),
      sta: new Date('2025-03-25T11:40:00'),
      stautc: new Date('2025-03-25T14:40:00'),
    },
    duration: '04:15',
    segments: [createMockSegmentVM()],
    journeyType: JourneyType.OUTBOUND,
    checkinInfo: {
      openingCheckInDate: new Date('2025-03-24T07:25:00'),
      closingCheckInDate: new Date('2025-03-25T06:25:00'),
    },
  } as JourneyVM;
}

function createMockSegmentVM(id: string = 'segment-1'): SegmentVM {
  return {
    id,
    referenceId: 'SEG1',
    origin: { city: 'GIG', country: 'BR' },
    destination: { city: 'BOG', country: 'CO' },
    schedule: {
      std: new Date('2025-03-25T07:25:00'),
      stdutc: new Date('2025-03-25T10:25:00'),
      sta: new Date('2025-03-25T11:40:00'),
      stautc: new Date('2025-03-25T14:40:00'),
    },
    duration: '04:15',
    legs: [],
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      number: '260',
      model: 'BOEING787',
    },
  } as SegmentVM;
}

function createMockPax(): any {
  return {
    id: 'pax-1',
    name: { first: 'John', last: 'Doe' },
    type: { category: PaxCategoryType.ADULT },
    status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
    referenceId: 'PAX1',
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: 'segment-1',
        seat: '4A',
        status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
      } as PaxSegmentsInfo,
    ],
  };
}

function createMockCheckInSummaryBuilderData(): CheckInSummaryBuilderData {
  return {
    booking: {
      journeys: [createMockJourney()],
      pax: [createMockPax()],
    } as Booking,
    paxSegmentCheckInStatus: [],
    segmentsStatusByJourney: [],
  };
}

function createMockCheckInSummaryBuilderDataWithInfant(): CheckInSummaryBuilderData {
  const infantPax = {
    id: 'infant-1',
    name: { first: 'Infant', last: 'Baby' },
    type: { category: PaxCategoryType.INFANT },
    referenceId: 'INF1',
  };
  const adultPax = createMockPax();
  adultPax.dependentPaxes = ['infant-1'];
  return {
    booking: {
      journeys: [createMockJourney()],
      pax: [adultPax, infantPax],
    } as Booking,
    paxSegmentCheckInStatus: [],
    segmentsStatusByJourney: [],
  };
}

describe('CheckInSummaryBuilderService', () => {
  let service: CheckInSummaryBuilderService;
  let journeyEnricherService: jasmine.SpyObj<JourneyEnricherService>;
  let textHelperService: jasmine.SpyObj<TextHelperService>;

  beforeEach(() => {
    const journeyEnricherSpy = jasmine.createSpyObj('JourneyEnricherService', ['enrichJourneysWithStatus']);
    const textHelperSpy = jasmine.createSpyObj('TextHelperService', ['formatPassengerName']);
    
    TestBed.configureTestingModule({
      providers: [
        CheckInSummaryBuilderService,
        { provide: JourneyEnricherService, useValue: journeyEnricherSpy },
        { provide: TextHelperService, useValue: textHelperSpy },
      ],
    });
    service = TestBed.inject(CheckInSummaryBuilderService);
    journeyEnricherService = TestBed.inject(JourneyEnricherService) as jasmine.SpyObj<JourneyEnricherService>;
    textHelperService = TestBed.inject(TextHelperService) as jasmine.SpyObj<TextHelperService>;
    
    // Setup default mock returns
    journeyEnricherService.enrichJourneysWithStatus.and.returnValue([createMockJourney()]);
    textHelperService.formatPassengerName.and.callFake((name: string) => name);
  });

  it('should be created', () => {
    // Arrange & Act
    // (service already created in beforeEach)

    // Assert
    expect(service).toBeTruthy();
  });

  describe('buildCheckInSummaryModel', () => {
    it('should call journeyEnricherService with booking journeys and segments status', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();

      // Act
      service.buildCheckInSummaryModel(mockData);

      // Assert
      expect(journeyEnricherService.enrichJourneysWithStatus).toHaveBeenCalledWith(
        mockData.booking.journeys,
        mockData.segmentsStatusByJourney
      );
    });

    it('should return enriched journeys with mapped passengers', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      const enrichedJourney = createMockJourney();
      journeyEnricherService.enrichJourneysWithStatus.and.returnValue([enrichedJourney]);

      // Act
      const result = service.buildCheckInSummaryModel(mockData);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].passengers).toBeDefined();
    });

    it('should handle empty journeys array', () => {
      // Arrange
      journeyEnricherService.enrichJourneysWithStatus.and.returnValue([]);
      const mockData: CheckInSummaryBuilderData = {
        booking: { journeys: [], pax: [] } as unknown as Booking,
        paxSegmentCheckInStatus: [],
        segmentsStatusByJourney: [],
      };

      // Act
      const result = service.buildCheckInSummaryModel(mockData);

      // Assert
      expect(result).toEqual([]);
    });

    it('should store booking, segmentsCheckInStatus, and segmentsStatus internally', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();

      // Act
      service.buildCheckInSummaryModel(mockData);

      // Assert
      expect((service as any).booking).toBe(mockData.booking);
      expect((service as any).segmentsCheckInStatus).toBe(mockData.paxSegmentCheckInStatus);
      expect((service as any).segmentsStatus).toBe(mockData.segmentsStatusByJourney);
    });
  });

  describe('mapPassengers', () => {
    it('should filter out infant passengers', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderDataWithInfant();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      const adultPaxCount = mockData.booking.pax.filter(p => p.type.category !== PaxCategoryType.INFANT).length;
      expect(result.length).toBe(adultPaxCount);
      expect(result.every((p: CheckInSummaryPassengerVM) => p.id !== 'infant-1')).toBe(true);
    });

    it('should map passenger with infant detail', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderDataWithInfant();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      const passengerWithInfant = result.find((p: CheckInSummaryPassengerVM) => p.id === 'pax-1');
      expect(passengerWithInfant).toBeDefined();
      expect(passengerWithInfant.detail).toContain('Infant');
      expect(passengerWithInfant.detail).toContain('Baby');
    });

    it('should map passenger without infant detail when no dependent', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      expect(result[0].detail).toBe('');
    });

    it('should map passenger name correctly', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      expect(result[0].name).toBe('John Doe');
    });

    it('should map loyalty number when available', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.booking.pax[0].loyaltyNumbers = [{ loyaltyNumber: '123456789', loyaltyType: 'Lifemiles' }];
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      expect(result[0].lifemilesNumber).toBe('123456789');
    });

    it('should use empty string for loyalty number when not available', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      expect(result[0].lifemilesNumber).toBe('');
    });

    it('should map passenger status correctly', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      const result = (service as any).mapPassengers(journeySegments);

      // Assert
      expect(result[0].status).toBeDefined();
    });

    it('should call getPassengerSeat for each passenger', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const spy = spyOn<any>(service, 'getPassengerSeat').and.returnValue(['4A']);
      const journeySegments: SegmentVM[] = [createMockSegmentVM()];

      // Act
      (service as any).mapPassengers(journeySegments);

      // Assert
      const expectedCalls = mockData.booking.pax.filter(p => p.type.category !== PaxCategoryType.INFANT).length;
      expect(spy).toHaveBeenCalledTimes(expectedCalls);
    });
  });

  describe('evaluateCheckInStatusPerJourney', () => {
    it('should set isCheckInAvailable to true when status is Open', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          status: 'Open',
          hoursToCheckin: 0,
          pax: [],
          reasonsStatus: [],
        } as unknown as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.isCheckInAvailable).toBe(true);
    });

    it('should set isCheckInAvailable to false when status is not Open', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          status: 'Closed',
          hoursToCheckin: 0,
          pax: [],
          reasonsStatus: [],
        } as unknown as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.isCheckInAvailable).toBe(false);
    });

    it('should set remainingTimeToCheckIn when hours to checkin is greater than 0 and not available', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      const mockTimeMeasure: TimeMeasureModel = { days: 1, hours: 23, minutes: 59, seconds: 0 };
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          status: 'NotAllowed',
          hoursToCheckin: 47.9833,
          pax: [],
          reasonsStatus: [],
        } as unknown as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;
      spyOn(dateHelper, 'convertHoursToFullTime').and.returnValue(mockTimeMeasure);

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(dateHelper.convertHoursToFullTime).toHaveBeenCalledWith(47.9833);
      expect(journey.remainingTimeToCheckIn).toEqual(mockTimeMeasure);
    });

    it('should not set remainingTimeToCheckIn when check-in is available', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          status: 'Open',
          hoursToCheckin: 5,
          pax: [],
          reasonsStatus: [],
        } as unknown as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.remainingTimeToCheckIn).toBeUndefined();
    });

    it('should not set remainingTimeToCheckIn when hours to checkin is 0', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          status: 'NotAllowed',
          hoursToCheckin: 0,
          pax: [],
          reasonsStatus: [],
        } as unknown as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.remainingTimeToCheckIn).toBeUndefined();
    });

    it('should return early when journey has no segments', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [],
      } as unknown as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.isCheckInAvailable).toBeUndefined();
    });

    it('should set isCheckInAvailable to false when segment status not found', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [];
      service.buildCheckInSummaryModel(mockData);
      const journey: CheckInSummaryJourneyVM = {
        segments: [{ id: 'segment-1' } as SegmentVM],
      } as CheckInSummaryJourneyVM;

      // Act
      (service as any).evaluateCheckInStatusPerJourney(journey);

      // Assert
      expect(journey.isCheckInAvailable).toBe(false);
    });
  });

  describe('mapPassengersWithCheckInStatus', () => {
    it('should map passengers with updated check-in status from segment', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          pax: [
            { paxId: 'pax-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
            { paxId: 'pax-2', status: PaxSegmentCheckinStatus.ALLOWED },
          ],
        } as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey = mockData.booking.journeys[0];
      spyOn<any>(service, 'mapPassengers').and.returnValue([
        { id: 'pax-1', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as CheckInSummaryPassengerVM,
        { id: 'pax-2', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as CheckInSummaryPassengerVM,
      ]);

      // Act
      const result = (service as any).mapPassengersWithCheckInStatus(journey);

      // Assert
      expect(result[0].status).toBe(PaxSegmentCheckinStatus.CHECKED_IN);
      expect(result[1].status).toBe(PaxSegmentCheckinStatus.ALLOWED);
    });

    it('should return base passengers when journey has no segments', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      service.buildCheckInSummaryModel(mockData);
      const journey = { ...mockData.booking.journeys[0], segments: [] };
      const basePassengers = [{ id: 'pax-1' } as CheckInSummaryPassengerVM];
      spyOn<any>(service, 'mapPassengers').and.returnValue(basePassengers);

      // Act
      const result = (service as any).mapPassengersWithCheckInStatus(journey);

      // Assert
      expect(result).toEqual(basePassengers);
    });

    it('should return base passengers when segment check-in status not found', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [];
      service.buildCheckInSummaryModel(mockData);
      const journey = mockData.booking.journeys[0];
      const basePassengers = [{ id: 'pax-1' } as CheckInSummaryPassengerVM];
      spyOn<any>(service, 'mapPassengers').and.returnValue(basePassengers);

      // Act
      const result = (service as any).mapPassengersWithCheckInStatus(journey);

      // Assert
      expect(result).toEqual(basePassengers);
    });

    it('should keep original status when pax not found in segment status', () => {
      // Arrange
      const mockData = createMockCheckInSummaryBuilderData();
      mockData.paxSegmentCheckInStatus = [
        {
          segmentId: 'segment-1',
          pax: [{ paxId: 'pax-1', status: PaxSegmentCheckinStatus.CHECKED_IN }],
        } as SegmentCheckIn,
      ];
      service.buildCheckInSummaryModel(mockData);
      const journey = mockData.booking.journeys[0];
      spyOn<any>(service, 'mapPassengers').and.returnValue([
        { id: 'pax-1', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as CheckInSummaryPassengerVM,
        { id: 'pax-2', status: PaxSegmentCheckinStatus.NOT_ALLOWED } as CheckInSummaryPassengerVM,
      ]);

      // Act
      const result = (service as any).mapPassengersWithCheckInStatus(journey);

      // Assert
      expect(result[0].status).toBe(PaxSegmentCheckinStatus.CHECKED_IN);
      expect(result[1].status).toBe(PaxSegmentCheckinStatus.NOT_ALLOWED);
    });
  });

  describe('getPassengerSeat', () => {
    it('should return seats for matching journey segments', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [
        { segmentId: 'segment-1', seat: '4A', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-2', seat: '5B', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-3', seat: '6C', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
      ];
      const journeySegments: SegmentVM[] = [
        { id: 'segment-1' } as SegmentVM,
        { id: 'segment-2' } as SegmentVM,
      ];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual(['4A', '5B']);
    });

    it('should return empty array when no segments match', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [
        { segmentId: 'segment-3', seat: '4A', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
      ];
      const journeySegments: SegmentVM[] = [
        { id: 'segment-1' } as SegmentVM,
        { id: 'segment-2' } as SegmentVM,
      ];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when paxSegments is empty', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [];
      const journeySegments: SegmentVM[] = [{ id: 'segment-1' } as SegmentVM];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when journeySegments is empty', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [
        { segmentId: 'segment-1', seat: '4A', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
      ];
      const journeySegments: SegmentVM[] = [];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle multiple matching segments', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [
        { segmentId: 'segment-1', seat: '4A', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-2', seat: '5B', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-3', seat: '6C', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
      ];
      const journeySegments: SegmentVM[] = [
        { id: 'segment-1' } as SegmentVM,
        { id: 'segment-2' } as SegmentVM,
        { id: 'segment-3' } as SegmentVM,
      ];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual(['4A', '5B', '6C']);
    });

    it('should preserve seat order from paxSegments', () => {
      // Arrange
      const paxSegments: PaxSegmentsInfo[] = [
        { segmentId: 'segment-3', seat: '6C', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-1', seat: '4A', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
        { segmentId: 'segment-2', seat: '5B', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN } as PaxSegmentsInfo,
      ];
      const journeySegments: SegmentVM[] = [
        { id: 'segment-1' } as SegmentVM,
        { id: 'segment-2' } as SegmentVM,
        { id: 'segment-3' } as SegmentVM,
      ];

      // Act
      // @ts-ignore
      const result = service.getPassengerSeat(paxSegments, journeySegments);

      // Assert
      expect(result).toEqual(['6C', '4A', '5B']);
    });
  });
});
