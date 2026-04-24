import { TestBed } from '@angular/core/testing';
import { SegmentStatus } from '@dcx/ui/api-layer';
import { JourneyStatus } from '@dcx/ui/libs';

import { CheckInSegmentStatus, SegmentsStatusByJourney } from '../../../models';
import { JourneyStatusBuilderService } from './journey-status-builder.service';

describe('JourneyStatusBuilderService', () => {
  let service: JourneyStatusBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JourneyStatusBuilderService],
    });
    service = TestBed.inject(JourneyStatusBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getData', () => {
    describe('when no segment data is provided', () => {
      it('should return undefined when segmentsStatus is empty array', () => {
        const result = service.getData('journey-1', []);
        expect(result).toBeUndefined();
      });

      it('should return undefined when segmentsStatus is undefined', () => {
        const result = service.getData('journey-1', undefined);
        expect(result).toBeUndefined();
      });

      it('should return undefined when journey is not found in segmentsStatus', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-2',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.ON_TIME })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBeUndefined();
      });

      it('should return undefined when journey has no segments', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBeUndefined();
      });
    });

    describe('single-segment journey', () => {
      it('should return ON_TIME status for single segment with ON_TIME status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.ON_TIME })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_TIME);
      });

      it('should return DELAYED status for single segment with DELAYED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.DELAYED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.DELAYED);
      });

      it('should return LANDED status for single segment with LANDED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.LANDED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.LANDED);
      });

      it('should return CANCELLED status for single segment with CANCELLED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.CANCELLED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.CANCELLED);
      });

      it('should return ON_ROUTE status for single segment with ON_ROUTE status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.ON_ROUTE })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_ROUTE);
      });

      it('should return DIVERTED status for single segment with DIVERTED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.DIVERTED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.DIVERTED);
      });

      it('should return DEPARTED status for single segment with DEPARTED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.DEPARTED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.DEPARTED);
      });

      it('should return RETURNED status for single segment with RETURNED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.RETURNED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.RETURNED);
      });

      it('should return CLOSED status for single segment with CLOSED status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.CLOSED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.CLOSED);
      });

      it('should return OPEN status for single segment with OPEN status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.OPEN })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.OPEN);
      });

      it('should return undefined for single segment with unmapped status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.SCHEDULED })],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBeUndefined();
      });
    });

    describe('multi-segment journey', () => {
      it('should return status of first non-landed segment when first segment has not landed', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.ON_ROUTE }),
              createMockSegmentStatus({ status: SegmentStatus.DELAYED }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_ROUTE);
      });

      it('should skip landed segments and return status of first non-landed segment', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.DELAYED }),
              createMockSegmentStatus({ status: SegmentStatus.ON_TIME }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.DELAYED);
      });

      it('should return LANDED when all segments have landed', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.LANDED);
      });

      it('should return status of middle segment when first is landed', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.ON_ROUTE }),
              createMockSegmentStatus({ status: SegmentStatus.ON_TIME }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_ROUTE);
      });

      it('should return status of last segment when all others are landed', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.ON_TIME }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_TIME);
      });

      it('should handle CANCELLED status in multi-segment journey', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.CANCELLED }),
              createMockSegmentStatus({ status: SegmentStatus.ON_TIME }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.CANCELLED);
      });

      it('should handle DEPARTED status in multi-segment journey', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.DEPARTED }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.DEPARTED);
      });

      it('should handle two-segment journey correctly', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.ON_TIME }),
              createMockSegmentStatus({ status: SegmentStatus.DELAYED }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.ON_TIME);
      });

      it('should return undefined when first non-landed segment has unmapped status', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [
              createMockSegmentStatus({ status: SegmentStatus.LANDED }),
              createMockSegmentStatus({ status: SegmentStatus.SCHEDULED }),
            ],
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle journey with many segments all landed', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: Array(10).fill(createMockSegmentStatus({ status: SegmentStatus.LANDED })),
          },
        ];

        const result = service.getData('journey-1', segmentsStatus);
        expect(result).toBe(JourneyStatus.LANDED);
      });

      it('should handle multiple journeys and return correct one', () => {
        const segmentsStatus: SegmentsStatusByJourney[] = [
          {
            journeyId: 'journey-1',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.ON_TIME })],
          },
          {
            journeyId: 'journey-2',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.DELAYED })],
          },
          {
            journeyId: 'journey-3',
            segmentsStatus: [createMockSegmentStatus({ status: SegmentStatus.CANCELLED })],
          },
        ];

        const result = service.getData('journey-2', segmentsStatus);
        expect(result).toBe(JourneyStatus.DELAYED);
      });
    });
  });

  // Helper function to create mock segment status
  function createMockSegmentStatus(overrides: Partial<CheckInSegmentStatus> = {}): CheckInSegmentStatus {
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
  }
});
