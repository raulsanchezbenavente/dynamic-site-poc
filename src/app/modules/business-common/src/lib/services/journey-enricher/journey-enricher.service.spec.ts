import { TestBed } from '@angular/core/testing';
import { SegmentStatus } from '@dcx/ui/api-layer';
import { JourneySchedule, JourneyStatus, JourneyVM, LegVM, SegmentVM, TransportType } from '@dcx/ui/libs';

import { CheckInSegmentStatus, SegmentsStatusByJourney } from '../../models';
import { JourneyStatusBuilderService } from '../journey-status';
import { JourneyEnricherService } from './journey-enricher.service';

describe('JourneyEnricherService', () => {
  let service: JourneyEnricherService;
  let mockJourneyStatusBuilderService: jasmine.SpyObj<JourneyStatusBuilderService>;

  const createMockSegmentStatus = (overrides: Partial<CheckInSegmentStatus> = {}): CheckInSegmentStatus => {
    return {
      origin: 'YYZ',
      destination: 'YVR',
      std: new Date('2024-01-01T10:00:00'),
      etd: new Date('2024-01-01T10:15:00'),
      atd: new Date('2024-01-01T10:20:00'),
      sta: new Date('2024-01-01T12:00:00'),
      eta: new Date('2024-01-01T12:15:00'),
      ata: new Date('2024-01-01T12:10:00'),
      stdutc: new Date('2024-01-01T15:00:00Z'),
      stautc: new Date('2024-01-01T17:00:00Z'),
      atdutc: new Date('2024-01-01T15:20:00Z'),
      atautc: new Date('2024-01-01T17:10:00Z'),
      status: SegmentStatus.ON_TIME,
      ...overrides,
    };
  };

  const createMockLeg = (overrides: Partial<LegVM> = {}): LegVM => {
    return {
      origin: 'YYZ',
      destination: 'YVR',
      duration: '02:00',
      std: new Date('2024-01-01T10:00:00'),
      stdutc: new Date('2024-01-01T15:00:00Z'),
      sta: new Date('2024-01-01T12:00:00'),
      stautc: new Date('2024-01-01T17:00:00Z'),
      transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
      ...overrides,
    };
  };

  beforeEach(() => {
    mockJourneyStatusBuilderService = jasmine.createSpyObj('JourneyStatusBuilderService', ['getData']);

    TestBed.configureTestingModule({
      providers: [
        JourneyEnricherService,
        { provide: JourneyStatusBuilderService, useValue: mockJourneyStatusBuilderService },
      ],
    });

    service = TestBed.inject(JourneyEnricherService);
  });

  describe('enrichJourneysWithStatus', () => {
    it('should return original journeys when segmentsStatus is empty', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          segments: [],
          schedule: {} as JourneySchedule,
          duration: '00:00',
        } as JourneyVM,
      ];

      // Act
      const result = service.enrichJourneysWithStatus(journeys, []);

      // Assert
      expect(result).toEqual(journeys);
    });

    it('should return original journeys when segmentsStatus is undefined', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          segments: [],
          schedule: {} as JourneySchedule,
          duration: '00:00',
        } as JourneyVM,
      ];

      // Act
      const result = service.enrichJourneysWithStatus(journeys);

      // Assert
      expect(result).toEqual(journeys);
    });

    it('should enrich journey with status when segmentsStatus has matching journeyId', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR', iataOperation: 'YVR' },
          segments: [
            {
              id: 'segment-1',
              origin: { city: 'YYZ', iata: 'YYZ' },
              destination: { city: 'YVR', iata: 'YVR' },
              schedule: {
                std: new Date('2024-01-01T10:00:00'),
                sta: new Date('2024-01-01T12:00:00'),
              } as JourneySchedule,
              legs: [],
              transport: { type: TransportType.PLANE, carrier: { code: 'AA', name: 'American Airlines' }, number: '101' },
            } as SegmentVM,
          ],
          schedule: {} as JourneySchedule,
          duration: '00:00',
        } as JourneyVM,
      ] as JourneyVM[];

      const segmentsStatus = [
        {
          journeyId: 'journey-1',
          segmentsStatus: [
            createMockSegmentStatus({
              origin: 'YYZ',
              destination: 'YVR',
              std: new Date('2024-01-01T10:00:00'),
              sta: new Date('2024-01-01T12:00:00'),
              etd: new Date('2024-01-01T10:15:00'),
              eta: new Date('2024-01-01T12:15:00'),
            }),
          ],
        },
      ] as SegmentsStatusByJourney[];
  
      mockJourneyStatusBuilderService.getData.and.returnValue(JourneyStatus.ON_TIME);

      // Act
      const result = service.enrichJourneysWithStatus(journeys, segmentsStatus);

      // Assert
      expect(result[0].status).toEqual(JourneyStatus.ON_TIME);
      expect(mockJourneyStatusBuilderService.getData).toHaveBeenCalledWith('journey-1', segmentsStatus);
    });

    it('should update iataOperation with last segment destination city', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR', iataOperation: 'YVR' },
          schedule: {} as JourneySchedule,
          duration: '02:00',
          segments: [
            {
              id: 'segment-1',
              origin: { city: 'YYZ', iata: 'YYZ' },
              destination: { city: 'YYC', iata: 'YYC' },
              schedule: {} as JourneySchedule,
              legs: [],
              transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
            } as SegmentVM,
            {
              id: 'segment-2',
              origin: { city: 'YYC', iata: 'YYC' },
              destination: { city: 'YVR', iata: 'YVR' },
              schedule: {} as JourneySchedule,
              legs: [],
              transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '202' },
            } as SegmentVM,
          ],
        } as JourneyVM,
      ];

      const segmentsStatus: SegmentsStatusByJourney[] = [
        {
          journeyId: 'journey-1',
          segmentsStatus: [],
        },
      ];

      mockJourneyStatusBuilderService.getData.and.returnValue(undefined);

      // Act
      const result = service.enrichJourneysWithStatus(journeys, segmentsStatus);

      // Assert
      expect(result[0].destination.iataOperation).toBe('YVR');
    });

    it('should use journey destination city when segments array is empty', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR', iataOperation: 'YVR' },
          schedule: {} as JourneySchedule,
          duration: '02:00',
          segments: [],
        } as JourneyVM,
      ];

      const segmentsStatus: SegmentsStatusByJourney[] = [
        {
          journeyId: 'journey-1',
          segmentsStatus: [],
        },
      ];

      mockJourneyStatusBuilderService.getData.and.returnValue(undefined);

      // Act
      const result = service.enrichJourneysWithStatus(journeys, segmentsStatus);

      // Assert
      expect(result[0].destination.iataOperation).toBe('YVR');
    });

    it('should handle diverted flight by updating last segment destination city', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR', iataOperation: 'YVR' },
          schedule: {} as JourneySchedule,
          duration: '02:00',
          segments: [
            {
              id: 'segment-1',
              origin: { city: 'YYZ', iata: 'YYZ' },
              destination: { city: 'YVR', iata: 'YVR' },
              schedule: {} as JourneySchedule,
              legs: [],
              transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
            } as SegmentVM,
          ],
        } as JourneyVM,
      ];

      const segmentsStatus: SegmentsStatusByJourney[] = [
        {
          journeyId: 'journey-1',
          segmentsStatus: [
            createMockSegmentStatus({
              origin: 'YYZ',
              destination: 'YYC', // Diverted to Calgary
              std: new Date('2024-01-01T10:00:00'),
              sta: new Date('2024-01-01T12:00:00'),
              status: SegmentStatus.DIVERTED,
            }),
          ],
        },
      ];

      mockJourneyStatusBuilderService.getData.and.returnValue(undefined);

      // Act
      const result = service.enrichJourneysWithStatus(journeys, segmentsStatus);

      // Assert
      expect(result[0].destination.iataOperation).toBe('YYC');
      expect(result[0].segments[0].destination.city).toBe('YYC');
    });

    it('should not add status property when journeyStatus is null', () => {
      // Arrange
      const journeys = [
        {
          id: 'journey-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR', iataOperation: 'YVR' },
          schedule: {} as JourneySchedule,
          duration: '02:00',
          segments: [],
        } as JourneyVM,
      ];

      const segmentsStatus: SegmentsStatusByJourney[] = [
        {
          journeyId: 'journey-1',
          segmentsStatus: [],
        },
      ];

      mockJourneyStatusBuilderService.getData.and.returnValue(undefined);

      // Act
      const result = service.enrichJourneysWithStatus(journeys, segmentsStatus);

      // Assert
      expect(result[0].status).toBeUndefined();
    });
  });

  describe('mapJourneySegments', () => {
    it('should map segments with real-time status data', () => {
      // Arrange
      const segments: SegmentVM[] = [
        {
          id: 'segment-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          schedule: {
            std: new Date('2024-01-01T10:00:00'),
            sta: new Date('2024-01-01T12:00:00'),
          } as JourneySchedule,
          legs: [
            createMockLeg({
              origin: 'YYZ',
              destination: 'YVR',
            }),
          ],
          transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
        } as SegmentVM,
      ];

      const segmentsStatus: CheckInSegmentStatus[] = [
        createMockSegmentStatus({
          origin: 'YYZ',
          destination: 'YVR',
          std: new Date('2024-01-01T10:00:00'),
          sta: new Date('2024-01-01T12:00:00'),
          etd: new Date('2024-01-01T10:15:00'),
          eta: new Date('2024-01-01T12:15:00'),
        }),
      ];

      // Act
      const result = service['mapJourneySegments'](segments, segmentsStatus);

      // Assert
      expect(result[0].schedule.etd).toEqual(new Date('2024-01-01T10:15:00'));
      expect(result[0].schedule.eta).toEqual(new Date('2024-01-01T12:15:00'));
    });

    it('should fallback to base schedule when no segment status is available', () => {
      // Arrange
      const segments: SegmentVM[] = [
        {
          id: 'segment-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          schedule: {
            std: new Date('2024-01-01T10:00:00'),
            sta: new Date('2024-01-01T12:00:00'),
          } as JourneySchedule,
          legs: [],
          transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
        } as SegmentVM,
      ];

      const segmentsStatus: CheckInSegmentStatus[] = [];

      // Act
      const result = service['mapJourneySegments'](segments, segmentsStatus);

      // Assert
      expect(result[0].schedule.std).toEqual(new Date('2024-01-01T10:00:00'));
      expect(result[0].schedule.sta).toEqual(new Date('2024-01-01T12:00:00'));
    });

    it('should match segments by array index for diverted flights', () => {
      // Arrange
      const segments: SegmentVM[] = [
        {
          id: 'segment-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          schedule: {} as JourneySchedule,
          legs: [],
          transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
        } as SegmentVM,
      ];

      const segmentsStatus: CheckInSegmentStatus[] = [
        createMockSegmentStatus({
          origin: 'YYZ',
          destination: 'YYC', // Diverted
          std: new Date('2024-01-01T10:00:00'),
          sta: new Date('2024-01-01T12:00:00'),
          status: SegmentStatus.DIVERTED,
        }),
      ];

      // Act
      const result = service['mapJourneySegments'](segments, segmentsStatus);

      // Assert
      expect(result[0].origin.city).toBe('YYZ');
      expect(result[0].destination.city).toBe('YYC');
    });

    it('should update leg origins and destinations with segment cities', () => {
      // Arrange
      const segments: SegmentVM[] = [
        {
          id: 'segment-1',
          origin: { city: 'YYZ', iata: 'YYZ' },
          destination: { city: 'YVR', iata: 'YVR' },
          schedule: {} as JourneySchedule,
          legs: [
            createMockLeg({
              origin: 'YYZ',
              destination: 'YVR',
            }),
          ],
          transport: { carrier: { code: 'AC', name: 'Air Canada' }, number: '101' },
        } as SegmentVM,
      ];

      const segmentsStatus: CheckInSegmentStatus[] = [
        createMockSegmentStatus({
          origin: 'YYZ',
          destination: 'YYC',
        }),
      ];

      // Act
      const result = service['mapJourneySegments'](segments, segmentsStatus);

      // Assert
      expect(result[0].legs[0].origin).toBe('YYZ');
      expect(result[0].legs[0].destination).toBe('YYC');
    });
  });

  describe('buildSegmentSchedule', () => {
    it('should return segment schedule when foundStatus is undefined', () => {
      // Arrange
      const segment: SegmentVM = {
        schedule: {
          std: new Date('2024-01-01T10:00:00'),
          sta: new Date('2024-01-01T12:00:00'),
          etd: new Date('2024-01-01T10:05:00'),
          eta: new Date('2024-01-01T12:05:00'),
        } as JourneySchedule,
      } as SegmentVM;

      // Act
      const result = service['buildSegmentSchedule'](segment, undefined);

      // Assert
      expect(result).toEqual(segment.schedule);
    });

    it('should build schedule from foundStatus when available', () => {
      // Arrange
      const segment: SegmentVM = {
        schedule: {
          std: new Date('2024-01-01T10:00:00'),
          sta: new Date('2024-01-01T12:00:00'),
        } as JourneySchedule,
      } as SegmentVM;

      const foundStatus: CheckInSegmentStatus = createMockSegmentStatus({
        ata: new Date('2024-01-01T12:10:00'),
        atd: new Date('2024-01-01T10:20:00'),
        eta: new Date('2024-01-01T12:15:00'),
        std: new Date('2024-01-01T10:00:00'),
        etd: new Date('2024-01-01T10:25:00'),
        sta: new Date('2024-01-01T12:00:00'),
        stdutc: new Date('2024-01-01T15:00:00Z'),
        stautc: new Date('2024-01-01T17:00:00Z'),
      });

      // Act
      const result = service['buildSegmentSchedule'](segment, foundStatus);

      // Assert
      expect(result.ata).toEqual(new Date('2024-01-01T12:10:00'));
      expect(result.atd).toEqual(new Date('2024-01-01T10:20:00'));
      expect(result.eta).toEqual(new Date('2024-01-01T12:15:00'));
      expect(result.etd).toEqual(new Date('2024-01-01T10:25:00'));
      expect(result.std).toEqual(new Date('2024-01-01T10:00:00'));
      expect(result.sta).toEqual(new Date('2024-01-01T12:00:00'));
      expect(result.stdutc).toEqual(new Date('2024-01-01T15:00:00Z'));
      expect(result.stautc).toEqual(new Date('2024-01-01T17:00:00Z'));
    });

    it('should prioritize real-time data over base schedule', () => {
      // Arrange
      const segment: SegmentVM = {
        schedule: {
          std: new Date('2024-01-01T10:00:00'),
          sta: new Date('2024-01-01T12:00:00'),
          etd: new Date('2024-01-01T10:00:00'), // Original ETD
          eta: new Date('2024-01-01T12:00:00'), // Original ETA
        } as JourneySchedule,
      } as SegmentVM;

      const foundStatus: CheckInSegmentStatus = createMockSegmentStatus({
        std: new Date('2024-01-01T10:00:00'),
        sta: new Date('2024-01-01T12:00:00'),
        etd: new Date('2024-01-01T10:30:00'), // Delayed ETD
        eta: new Date('2024-01-01T12:30:00'), // Delayed ETA
        status: SegmentStatus.DELAYED,
      });

      // Act
      const result = service['buildSegmentSchedule'](segment, foundStatus);

      // Assert
      expect(result.etd).toEqual(new Date('2024-01-01T10:30:00'));
      expect(result.eta).toEqual(new Date('2024-01-01T12:30:00'));
    });
  });

  describe('resolveSegmentCities', () => {
    it('should return segment IATA codes when foundStatus is undefined', () => {
      // Arrange
      const segment: SegmentVM = {
        origin: { city: 'YYZ', iata: 'YYZ' },
        destination: { city: 'YVR', iata: 'YVR' },
      } as SegmentVM;

      // Act
      const result = service['resolveSegmentCities'](segment, undefined);

      // Assert
      expect(result.originCity).toBe('YYZ');
      expect(result.destinationCity).toBe('YVR');
    });

    it('should prioritize foundStatus cities over segment cities', () => {
      // Arrange
      const segment: SegmentVM = {
        origin: { city: 'YYZ', iata: 'YYZ' },
        destination: { city: 'YVR', iata: 'YVR' },
      } as SegmentVM;

      const foundStatus: CheckInSegmentStatus = createMockSegmentStatus({
        origin: 'YYZ',
        destination: 'YYC', // Diverted
        status: SegmentStatus.DIVERTED,
      });

      // Act
      const result = service['resolveSegmentCities'](segment, foundStatus);

      // Assert
      expect(result.originCity).toBe('YYZ');
      expect(result.destinationCity).toBe('YYC');
    });

    it('should handle diversion scenario correctly', () => {
      // Arrange
      const segment: SegmentVM = {
        origin: { city: 'YYZ', iata: 'YYZ' },
        destination: { city: 'YVR', iata: 'YVR' },
      } as SegmentVM;

      const foundStatus: CheckInSegmentStatus = createMockSegmentStatus({
        origin: 'YYZ',
        destination: 'YEG', // Diverted to Edmonton
        status: SegmentStatus.DIVERTED,
      });

      // Act
      const result = service['resolveSegmentCities'](segment, foundStatus);

      // Assert
      expect(result.originCity).toBe('YYZ');
      expect(result.destinationCity).toBe('YEG');
    });
  });

  describe('mapSegmentLegs', () => {
    it('should map legs with schedule and city information', () => {
      // Arrange
      const legs: LegVM[] = [
        createMockLeg({
          origin: 'OLD_ORIGIN',
          destination: 'OLD_DEST',
        }),
      ];

      const schedule: JourneySchedule = {
        std: new Date('2024-01-01T10:00:00'),
        sta: new Date('2024-01-01T12:00:00'),
        etd: new Date('2024-01-01T10:15:00'),
        eta: new Date('2024-01-01T12:15:00'),
      } as JourneySchedule;

      const originCity = 'YYZ';
      const destinationCity = 'YVR';

      // Act
      const result = service['mapSegmentLegs'](legs, schedule, originCity, destinationCity);

      // Assert
      expect(result[0].origin).toBe('YYZ');
      expect(result[0].destination).toBe('YVR');
      expect(result[0].std).toEqual(new Date('2024-01-01T10:00:00'));
      expect(result[0].sta).toEqual(new Date('2024-01-01T12:00:00'));
      expect(result[0].etd).toEqual(new Date('2024-01-01T10:15:00'));
      expect(result[0].eta).toEqual(new Date('2024-01-01T12:15:00'));
    });

    it('should handle multiple legs', () => {
      // Arrange
      const legs: LegVM[] = [
        createMockLeg({ origin: 'YYZ', destination: 'YYC' }),
        createMockLeg({ origin: 'YYC', destination: 'YVR' }),
      ];

      const schedule: JourneySchedule = {
        std: new Date('2024-01-01T10:00:00'),
        sta: new Date('2024-01-01T12:00:00'),
      } as JourneySchedule;

      const originCity = 'YYZ';
      const destinationCity = 'YVR';

      // Act
      const result = service['mapSegmentLegs'](legs, schedule, originCity, destinationCity);

      // Assert
      expect(result).toHaveSize(2);
      expect(result[0].origin).toBe('YYZ');
      expect(result[0].destination).toBe('YVR');
      expect(result[1].origin).toBe('YYZ');
      expect(result[1].destination).toBe('YVR');
    });

    it('should preserve existing leg properties and merge schedule', () => {
      // Arrange
      const legs: LegVM[] = [
        createMockLeg({
          origin: 'YYZ',
          destination: 'YVR',
        }),
      ];

      const schedule: JourneySchedule = {
        std: new Date('2024-01-01T10:00:00'),
        sta: new Date('2024-01-01T12:00:00'),
      } as JourneySchedule;

      const originCity = 'YYZ';
      const destinationCity = 'YVR';

      // Act
      const result = service['mapSegmentLegs'](legs, schedule, originCity, destinationCity);

      // Assert
      expect(result[0].transport.carrier.code).toBe('AC');
      expect(result[0].transport.number).toBe('101');
      expect(result[0].duration).toBe('02:00');
      expect(result[0].std).toEqual(new Date('2024-01-01T10:00:00'));
    });

    it('should return empty array when legs array is empty', () => {
      // Arrange
      const legs: LegVM[] = [];
      const schedule: JourneySchedule = {} as JourneySchedule;
      const originCity = 'YYZ';
      const destinationCity = 'YVR';

      // Act
      const result = service['mapSegmentLegs'](legs, schedule, originCity, destinationCity);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
