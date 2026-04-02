import { TestBed } from '@angular/core/testing';
import { PaxSegmentCheckinStatus } from '@dcx/ui/libs';
import { PaxSegmentInfo } from '@dcx/ui/api-layer';

import { SegmentAlertHelperService } from './segment-alert-helper.service';
import { CheckInSummaryPassengerVM } from '../components/check-in-summary/models/check-in-summary-passenger-vm.model';

describe('SegmentAlertHelperService', () => {
  let service: SegmentAlertHelperService;
  const SEGMENT_ID = 'SEG-1';
  const OTHER_SEGMENT_ID = 'SEG-2';
  let passengerIndex = 0;

  const createPassenger = (
    segments: Array<{ segmentId: string; status: PaxSegmentCheckinStatus }>
  ): CheckInSummaryPassengerVM => ({
    id: `P-${++passengerIndex}`,
    name: `Passenger ${passengerIndex}`,
    lifemilesNumber: `LM-${passengerIndex}`,
    status: PaxSegmentCheckinStatus.CHECKED_IN,
    referenceId: `REF-${passengerIndex}`,
    segmentsInfo: segments.length
      ? segments.map(({ segmentId, status }) => ({ segmentId, status } as PaxSegmentInfo))
      : undefined,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SegmentAlertHelperService);
    passengerIndex = 0;
  });

  it('detects standby passengers for a segment', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.STAND_BY }]),
      createPassenger([{ segmentId: OTHER_SEGMENT_ID, status: PaxSegmentCheckinStatus.OVERBOOKED }]),
    ];

    expect(service.hasStandbyOrOverbookingForSegment(passengers, SEGMENT_ID)).toBeTrue();
    expect(service.hasStandbyForSegment(passengers, SEGMENT_ID)).toBeTrue();
    expect(service.hasOverbookingForSegment(passengers, SEGMENT_ID)).toBeFalse();
  });

  it('detects overbooked passengers for a segment', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.OVERBOOKED }]),
      createPassenger([{ segmentId: OTHER_SEGMENT_ID, status: PaxSegmentCheckinStatus.STAND_BY }]),
    ];

    expect(service.hasStandbyOrOverbookingForSegment(passengers, SEGMENT_ID)).toBeTrue();
    expect(service.hasOverbookingForSegment(passengers, SEGMENT_ID)).toBeTrue();
    expect(service.hasStandbyForSegment(passengers, SEGMENT_ID)).toBeFalse();
  });

  it('returns false when no passenger has standby or overbooking for the segment', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.CHECKED_IN }]),
      createPassenger([{ segmentId: OTHER_SEGMENT_ID, status: PaxSegmentCheckinStatus.STAND_BY }]),
      createPassenger([]),
    ];

    expect(service.hasStandbyOrOverbookingForSegment(passengers, SEGMENT_ID)).toBeFalse();
  });

  it('returns standby status even if other passengers are overbooked', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.OVERBOOKED }]),
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.STAND_BY }]),
    ];

    expect(service.getSegmentAlertStatus(passengers, SEGMENT_ID)).toBe(PaxSegmentCheckinStatus.STAND_BY);
  });

  it('returns overbooking status when there are no standby passengers', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.OVERBOOKED }]),
      createPassenger([{ segmentId: OTHER_SEGMENT_ID, status: PaxSegmentCheckinStatus.STAND_BY }]),
    ];

    expect(service.getSegmentAlertStatus(passengers, SEGMENT_ID)).toBe(PaxSegmentCheckinStatus.OVERBOOKED);
  });

  it('returns null when there are no standby or overbooking statuses for the segment', () => {
    const passengers = [
      createPassenger([{ segmentId: SEGMENT_ID, status: PaxSegmentCheckinStatus.CHECKED_IN }]),
      createPassenger([{ segmentId: OTHER_SEGMENT_ID, status: PaxSegmentCheckinStatus.OVERBOOKED }]),
      createPassenger([]),
    ];

    expect(service.getSegmentAlertStatus(passengers, SEGMENT_ID)).toBeNull();
  });
});
