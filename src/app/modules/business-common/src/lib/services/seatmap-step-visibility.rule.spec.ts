import { TestBed } from '@angular/core/testing';
import { Booking, EnumStorageKey, PaxSegmentCheckinStatus, SessionStore, StorageService } from '../../../../libs/src/lib/shared';

import { OverbookingValidationService } from './overbooking-validation.service';
import { SeatmapStepVisibilityRule } from './seatmap-step-visibility.rule';

describe('SeatmapStepVisibilityRule', () => {
  let rule: SeatmapStepVisibilityRule;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let sessionStoreMock: jasmine.SpyObj<SessionStore>;
  let overbookingValidationServiceMock: jasmine.SpyObj<OverbookingValidationService>;

  const mockBookingWithOcaPassengers: Partial<Booking> = {
    journeys: [
      {
        id: 'journey-1',
        segments: [{ id: 'segment-1' }, { id: 'segment-2' }],
      },
      {
        id: 'journey-2',
        segments: [{ id: 'segment-3' }],
      },
    ],
    pax: [
      {
        id: 'pax-1',
        referenceId: 'pax-1',
        segmentsInfo: [
          { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          { segmentId: 'segment-2', status: PaxSegmentCheckinStatus.STAND_BY },
        ],
      },
      {
        id: 'pax-2',
        referenceId: 'pax-2',
        segmentsInfo: [
          { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          { segmentId: 'segment-2', status: PaxSegmentCheckinStatus.OVERBOOKED },
        ],
      },
    ],
  } as Booking;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getSessionStorage']);
    sessionStoreMock = jasmine.createSpyObj('SessionStore', ['getSession']);
    overbookingValidationServiceMock = jasmine.createSpyObj('OverbookingValidationService', [
      'everySelectedPaxHasOverbookOrStandByStatus',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SeatmapStepVisibilityRule,
        { provide: StorageService, useValue: storageServiceMock },
        { provide: SessionStore, useValue: sessionStoreMock },
        { provide: OverbookingValidationService, useValue: overbookingValidationServiceMock },
      ],
    });

    rule = TestBed.inject(SeatmapStepVisibilityRule);
  });

  describe('shouldShowSeatmapStep', () => {
    it('should return true when not all passengers are blocked (OverbookingValidationService returns false)', () => {
      storageServiceMock.getSessionStorage.and.returnValue(null);
      sessionStoreMock.getSession.and.returnValue({ session: { booking: null } } as any);
      overbookingValidationServiceMock.everySelectedPaxHasOverbookOrStandByStatus.and.returnValue(false);

      const result = rule.shouldShowSeatmapStep();

      expect(result).toBe(true);
      expect(overbookingValidationServiceMock.everySelectedPaxHasOverbookOrStandByStatus).toHaveBeenCalled();
    });

    it('should return false when all passengers are blocked (OverbookingValidationService returns true)', () => {
      storageServiceMock.getSessionStorage.and.callFake((key: EnumStorageKey) => {
        if (key === EnumStorageKey.SelectedPassengersByJourney) {
          return { 'journey-1': ['pax-1', 'pax-2'] };
        }
        return null;
      });
      sessionStoreMock.getSession.and.returnValue({ session: { booking: mockBookingWithOcaPassengers } } as any);
      overbookingValidationServiceMock.everySelectedPaxHasOverbookOrStandByStatus.and.returnValue(true);

      const result = rule.shouldShowSeatmapStep();

      expect(result).toBe(false);
    });

    it('should pass booking and selectedPassengersByJourney to OverbookingValidationService', () => {
      const selectedPassengers = { 'journey-1': ['pax-1'] };
      storageServiceMock.getSessionStorage.and.callFake((key: EnumStorageKey) => {
        if (key === EnumStorageKey.SelectedPassengersByJourney) return selectedPassengers;
        return null;
      });
      sessionStoreMock.getSession.and.returnValue({ session: { booking: mockBookingWithOcaPassengers } } as any);
      overbookingValidationServiceMock.everySelectedPaxHasOverbookOrStandByStatus.and.returnValue(false);

      rule.shouldShowSeatmapStep();

      expect(overbookingValidationServiceMock.everySelectedPaxHasOverbookOrStandByStatus).toHaveBeenCalledWith(
        mockBookingWithOcaPassengers as Booking,
        selectedPassengers
      );
    });
  });
});
