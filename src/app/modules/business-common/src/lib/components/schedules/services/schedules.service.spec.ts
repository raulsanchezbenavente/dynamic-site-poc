import { ScheduleService } from './schedules.service';
import { JourneyVM, JourneyStatus } from '@dcx/ui/libs';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(() => {
    service = new ScheduleService();
  });

  describe('getTotalDays', () => {
    it('should return difference in days using actual arrival date', () => {
      const journey = {
        schedule: {
          std: new Date('2025-01-01T10:00:00'),
          sta: new Date('2025-01-03T10:00:00'),
        },
        segments: [
          {
            legs: [{}],
            schedule: {
              ata: new Date('2025-01-05T10:00:00'),
              eta: new Date('2025-01-04T10:00:00'),
            },
          },
        ],
      } as unknown as JourneyVM;

      const days = service.getTotalDays(journey);
      expect(days).toBe(4);
    });

    it('should fallback to scheduled arrival if actual/estimated are missing', () => {
      const journey = {
        schedule: {
          std: new Date('2025-01-01T10:00:00'),
          sta: new Date('2025-01-02T10:00:00'),
        },
        segments: [
          {
            legs: [
              { sta: new Date('2025-01-03T10:00:00') },
            ],
            schedule: {},
          },
        ],
      } as JourneyVM;

      const days = service.getTotalDays(journey);
      expect(days).toBe(2);
    });
  });

  describe('buildLegsDetails', () => {
    it('should return LegsDetails structure with correct legs and stops', () => {
      const journey = {
        duration: '05:30',
        segments: [
          { legs: [1, 2] },
          { legs: [3] },
        ],
      } as unknown as JourneyVM;

      const result = service.buildLegsDetails(journey);
      expect(result.model.legs.length).toBe(3);
      expect(result.model.stopsNumber).toBe(2);
      expect(result.model.duration).toBe('05:30');
    });
  });

  describe('getDepartureTimeComparison', () => {
    it('should return correct departure time comparison', () => {
      const journey = {
        schedule: {
          std: new Date('2025-01-01T08:00:00'),
        },
        segments: [
          {
            schedule: {
              etd: new Date('2025-01-01T08:30:00'),
              atd: new Date('2025-01-01T08:45:00'),
            },
          },
        ],
      } as JourneyVM;

      const result = service.getDepartureTimeComparison(journey);
      expect(result).toEqual({
        scheduled: '08:00',
        estimated: '08:30',
        actual: '08:45',
        hasChanged: true,
      });
    });
  });

  describe('getArrivalTimeComparison', () => {
    it('should return correct arrival time when status is normal', () => {
      const journey = {
        schedule: {
          sta: new Date('2025-01-02T12:00:00'),
        },
        segments: [
          {
            schedule: {
              ata: new Date('2025-01-02T12:30:00'),
              eta: new Date('2025-01-02T12:15:00'),
              sta: new Date('2025-01-02T12:00:00'),
            },
            status: JourneyStatus.CONFIRMED,
          },
        ],
      } as unknown as JourneyVM;

      const result = service.getArrivalTimeComparison(journey);
      expect(result).toEqual({
        scheduled: '12:00',
        estimated: '12:15',
        actual: '12:30',
        hasChanged: true,
      });
    });

    it('should still show actual ata even if journey is RETURNED', () => {
      const journey = {
        schedule: {
          sta: new Date('2025-01-02T12:00:00'),
        },
        segments: [
          {
            schedule: {
              ata: new Date('2025-01-02T12:30:00'),
              eta: new Date('2025-01-02T12:15:00'),
              sta: new Date('2025-01-02T12:00:00'),
            },
            status: JourneyStatus.RETURNED,
          },
        ],
      } as unknown as JourneyVM;

      const result = service.getArrivalTimeComparison(journey);
      expect(result).toEqual({
        scheduled: '12:00',
        estimated: '12:15',
        actual: '12:30',
        hasChanged: true,
      });
    });
  });
});
