import { Injectable } from '@angular/core';
import { PaxSegmentCheckinStatus } from '@dcx/ui/api-layer';
import { Booking, Passenger, PaxSegmentsInfo, SegmentVM } from '@dcx/ui/libs';

/**
 * Service responsible for evaluating check-in status across the booking.
 * Provides centralized logic for determining if passengers are checked in
 * globally or for specific journeys/segments.
 *
 * This is a pure evaluation service with no side effects.
 *
 * Used by:
 * - CheckInSummaryComponent: Evaluates per-journey check-in status
 * - Other components: Evaluate global check-in status for button visibility
 */
@Injectable({
  providedIn: 'root',
})
export class CheckedInPassengersService {
  /**
   * Checks if all passengers in the booking are checked in across all segments.
   *
   * @param booking - The booking to evaluate
   * @returns true if all passengers are in checked status (checkedIn, standBy, overbooked), false otherwise
   */
  public areAllPassengersChecked(booking: Booking | null): boolean {
    if (!booking?.pax || booking.pax.length === 0) {
      return false;
    }

    const allChecked = booking.pax.every((pax) =>
      pax.segmentsInfo?.every(
        (segment) =>
          segment.status === PaxSegmentCheckinStatus.CHECKED_IN ||
          segment.status === PaxSegmentCheckinStatus.OVERBOOKED ||
          segment.status === PaxSegmentCheckinStatus.STAND_BY
      )
    );

    return allChecked;
  }

  /**
   * Gets the check-in status by journey.
   * Returns a mapping of journeyId to passenger reference IDs for journeys where all passengers are checked in.
   *
   * This groups all passengers by journey and returns only those journeys where:
   * - All passengers on that journey are checked in for all segments of that journey
   * - There is at least one passenger
   *
   * @param booking - The booking to evaluate
   * @returns Record mapping journeyId to array of passenger reference IDs
   */
  public getCheckInStatusByJourney(booking: Booking): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    booking.journeys.forEach((journey) => {
      const journeyId = journey.id;
      const segmentIds = new Set(journey.segments.map((s: SegmentVM) => s.id));

      const allPaxCheckedInForJourney = booking.pax.every((p: Passenger) => {
        const journeySegmentsInfo = p.segmentsInfo?.filter((si: PaxSegmentsInfo) => segmentIds.has(si.segmentId)) || [];
        return journeySegmentsInfo.every((si: PaxSegmentsInfo) => si.status === PaxSegmentCheckinStatus.CHECKED_IN);
      });

      if (allPaxCheckedInForJourney && booking.pax.length > 0) {
        result[journeyId] = booking.pax
          .map((p: Passenger) => p.referenceId)
          .filter((id): id is string => id !== undefined);
      }
    });

    return result;
  }
}
