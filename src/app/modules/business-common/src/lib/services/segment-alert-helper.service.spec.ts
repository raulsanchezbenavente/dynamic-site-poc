import { TestBed } from '@angular/core/testing';
import { BoardingPassEligibilityStatus, PaxSegmentInfo } from '@dcx/ui/api-layer';
import { AlertPanelType } from '@dcx/ui/design-system';
import { PaxSegmentCheckinStatus } from '@dcx/ui/libs';

import { CheckInSummaryPassengerVM } from '../components/check-in-summary/models/check-in-summary-passenger-vm.model';
import { SegmentAlertHelperService } from './segment-alert-helper.service';

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

  const createPassengerWithBoardingPassEligibility = (
    options: {
      segmentId?: string;
      boardingPassEligibilityStatus?: BoardingPassEligibilityStatus;
      reasons?: string[];
    } = {}
  ): CheckInSummaryPassengerVM => ({
    id: `P-${++passengerIndex}`,
    name: `Passenger ${passengerIndex}`,
    lifemilesNumber: `LM-${passengerIndex}`,
    status: PaxSegmentCheckinStatus.CHECKED_IN,
    referenceId: `REF-${passengerIndex}`,
    segmentsInfo: [
      {
        segmentId: options.segmentId ?? SEGMENT_ID,
        status: PaxSegmentCheckinStatus.CHECKED_IN,
        boardingPassEligibility: {
          boardingPassEligibilityStatus: options.boardingPassEligibilityStatus,
          reasons: options.reasons ?? [],
        },
      } as PaxSegmentInfo,
    ],
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

  it('returns true when boarding pass is blocked for selected segment', () => {
    const passenger = createPassengerWithBoardingPassEligibility({
      boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
    });

    expect(service.isBoardingPassBlockedForSegment(passenger, SEGMENT_ID)).toBeTrue();
  });

  it('returns false when boarding pass is eligible for selected segment', () => {
    const passenger = createPassengerWithBoardingPassEligibility({
      boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
    });

    expect(service.isBoardingPassBlockedForSegment(passenger, SEGMENT_ID)).toBeFalse();
  });

  it('returns false when segment does not exist while checking boarding pass blocked state', () => {
    const passenger = createPassengerWithBoardingPassEligibility({
      segmentId: OTHER_SEGMENT_ID,
      boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
    });

    expect(service.isBoardingPassBlockedForSegment(passenger, SEGMENT_ID)).toBeFalse();
  });

  it('returns unique mapped messages for blocked passengers in a segment', () => {
    const passengers = [
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
        reasons: ['PassengerNotAccepted', 'Other'],
      }),
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
        reasons: ['Other'],
      }),
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
        reasons: ['FlightEligibilityRule'],
      }),
    ];

    const mapReason = (reason: string): string => `mapped-${reason}`;
    const result = service.getBlockedBoardingPassMessagesForSegment(passengers, SEGMENT_ID, 'fallback', mapReason);

    expect(result).toEqual(['mapped-PassengerNotAccepted', 'mapped-Other']);
  });

  it('uses fallback message when blocked passenger has no reasons', () => {
    const passengers = [
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
        reasons: [],
      }),
    ];

    const result = service.getBlockedBoardingPassMessagesForSegment(passengers, SEGMENT_ID, 'fallback', (r) => r);

    expect(result).toEqual(['fallback']);
  });

  it('returns null alert config when there are no blocked messages', () => {
    const passengers = [
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
      }),
    ];

    const result = service.buildBlockedBoardingPassAlertConfigForSegment(
      passengers,
      SEGMENT_ID,
      'Blocked title',
      'fallback',
      (reason) => reason
    );

    expect(result).toBeNull();
  });

  it('builds warning alert config with unordered list description for blocked reasons', () => {
    const passengers = [
      createPassengerWithBoardingPassEligibility({
        boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
        reasons: ['Other'],
      }),
    ];

    const result = service.buildBlockedBoardingPassAlertConfigForSegment(
      passengers,
      SEGMENT_ID,
      'Blocked title',
      'fallback',
      (reason) => `mapped-${reason}`
    );

    expect(result).toEqual({
      config: {
        alertType: AlertPanelType.WARNING,
        title: 'Blocked title',
      },
      messages: ['mapped-Other'],
    });
  });
});
