import { TestBed } from '@angular/core/testing';
import { Booking, PaxSegmentCheckinStatus, SelectedPassengersByJourney } from '@dcx/ui/libs';

import { OverbookingValidationService } from './overbooking-validation.service';

describe('OverbookingValidationService', () => {
  let service: OverbookingValidationService;

  const buildBooking = (booking: Record<string, unknown>): Booking => booking as unknown as Booking;
  const buildSelection = (selection: Record<string, string[]>): SelectedPassengersByJourney =>
    selection as SelectedPassengersByJourney;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OverbookingValidationService],
    });

    service = TestBed.inject(OverbookingValidationService);
  });

  it('identifies when a passenger is overbooked on a given segment', () => {
    const pax = {
      segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.OVERBOOKED }],
    };

    expect(service.hasOverbookedStatus(pax, 'S1')).toBeTrue();
    expect(service.hasOverbookedStatus(pax, 'S2')).toBeFalse();
  });

  it('identifies when a passenger is on standby on a given segment', () => {
    const pax = {
      segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.STAND_BY }],
    };

    expect(service.hasStandByStatus(pax, 'S1')).toBeTrue();
    expect(service.hasStandByStatus(pax, 'S2')).toBeFalse();
  });

  it('combines the overbooked and standby checks for a segment', () => {
    const overbookedPax = {
      segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.OVERBOOKED }],
    };
    const standbyPax = {
      segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.STAND_BY }],
    };

    expect(service.hasOverbookOrStandByStatus(overbookedPax, 'S1')).toBeTrue();
    expect(service.hasOverbookOrStandByStatus(standbyPax, 'S1')).toBeTrue();
    expect(service.hasOverbookOrStandByStatus(overbookedPax, 'S2')).toBeFalse();
  });

  describe('selectedPaxHasOverbookOrStandByStatusForSegment', () => {
    it('returns true when every selected passenger has an allowed status for the segment', () => {
      const booking = buildBooking({
        journeys: [
          {
            id: 'J1',
            segments: [
              { id: 'S1' },
              { id: 'S2' },
            ],
          },
        ],
        pax: [
          {
            referenceId: 'P1',
            segmentsInfo: [
              { segmentId: 'S1', status: PaxSegmentCheckinStatus.OVERBOOKED },
              { segmentId: 'S2', status: PaxSegmentCheckinStatus.STAND_BY },
            ],
          },
          {
            referenceId: 'P2',
            segmentsInfo: [
              { segmentId: 'S1', status: PaxSegmentCheckinStatus.STAND_BY },
              { segmentId: 'S2', status: PaxSegmentCheckinStatus.OVERBOOKED },
            ],
          },
        ],
      });
      const selected = buildSelection({ J1: ['P1', 'P2'] });

      expect(
        service.selectedPaxHasOverbookOrStandByStatusForSegment('S1', booking, selected)
      ).toBeTrue();
      expect(
        service.selectedPaxHasOverbookOrStandByStatusForSegment('S2', booking, selected)
      ).toBeTrue();
    });

    it('returns false when at least one selected passenger lacks the required status', () => {
      const booking = buildBooking({
        journeys: [
          {
            id: 'J1',
            segments: [{ id: 'S1' }],
          },
        ],
        pax: [
          {
            referenceId: 'P1',
            segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.OVERBOOKED }],
          },
          {
            referenceId: 'P2',
            segmentsInfo: [{ segmentId: 'S1', status: PaxSegmentCheckinStatus.NOT_ALLOWED }],
          },
        ],
      });
      const selected = buildSelection({ J1: ['P1', 'P2'] });

      expect(
        service.selectedPaxHasOverbookOrStandByStatusForSegment('S1', booking, selected)
      ).toBeFalse();
    });
  });

  describe('everySelectedPaxHasOverbookOrStandByStatus', () => {
    it('returns true when each selected passenger is overbooked or standby for their segments', () => {
      const booking = buildBooking({
        journeys: [
          {
            id: 'J1',
            segments: [
              { id: 'S1' },
              { id: 'S2' },
            ],
          },
          {
            id: 'J2',
            segments: [{ id: 'S3' }],
          },
        ],
        pax: [
          {
            referenceId: 'P1',
            segmentsInfo: [
              { segmentId: 'S1', status: PaxSegmentCheckinStatus.OVERBOOKED },
              { segmentId: 'S2', status: PaxSegmentCheckinStatus.STAND_BY },
            ],
          },
          {
            referenceId: 'P2',
            segmentsInfo: [{ segmentId: 'S3', status: PaxSegmentCheckinStatus.STAND_BY }],
          },
        ],
      });
      const selected = buildSelection({ J1: ['P1'], J2: ['P2'] });

      expect(service.everySelectedPaxHasOverbookOrStandByStatus(booking, selected)).toBeTrue();
    });

    it('returns false when a passenger has no status entries for the selected segments', () => {
      const booking = buildBooking({
        journeys: [
          {
            id: 'J1',
            segments: [
              { id: 'S1' },
              { id: 'S2' },
            ],
          },
        ],
        pax: [
          {
            referenceId: 'P1',
            segmentsInfo: [{ segmentId: 'S3', status: PaxSegmentCheckinStatus.OVERBOOKED }],
          },
        ],
      });
      const selected = buildSelection({ J1: ['P1'] });

      expect(service.everySelectedPaxHasOverbookOrStandByStatus(booking, selected)).toBeFalse();
    });
  });
});
