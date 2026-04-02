import { Injectable } from '@angular/core';
import { Booking, PaxSegmentCheckinStatus, SelectedPassengersByJourney } from '@dcx/ui/libs';

/**
 * Service to validate overbooking and standby status for passengers.
 * Provides business logic for checking passenger statuses across journeys and segments.
 *
 * This service is used by components that need to determine passenger overbooking conditions,
 * such as WCIOverbookedManagerComponent.
 */
@Injectable({ providedIn: 'root' })
export class OverbookingValidationService {
  /**
   * Checks if a passenger has overbooked status for a specific segment.
   *
   * @param pax - The passenger object
   * @param segmentId - The segment ID to check
   * @returns True if the passenger has overbooked status for the segment
   */
  public hasOverbookedStatus(pax: any, segmentId: string): boolean {
    const segmentInfo = pax.segmentsInfo?.find((info: any) => info.segmentId === segmentId);
    return segmentInfo?.status === PaxSegmentCheckinStatus.OVERBOOKED;
  }

  /**
   * Checks if a passenger has standby status for a specific segment.
   *
   * @param pax - The passenger object
   * @param segmentId - The segment ID to check
   * @returns True if the passenger has standby status for the segment
   */
  public hasStandByStatus(pax: any, segmentId: string): boolean {
    const segmentInfo = pax.segmentsInfo?.find((info: any) => info.segmentId === segmentId);
    return segmentInfo?.status === PaxSegmentCheckinStatus.STAND_BY;
  }

  /**
   * Checks if a passenger has either overbooked or standby status for a specific segment.
   *
   * @param pax - The passenger object
   * @param segmentId - The segment ID to check
   * @returns True if the passenger has overbooked or standby status
   */
  public hasOverbookOrStandByStatus(pax: any, segmentId: string): boolean {
    return this.hasOverbookedStatus(pax, segmentId) || this.hasStandByStatus(pax, segmentId);
  }

  /**
   * Checks if selected passengers have overbooked or standby status for a specific segment.
   *
   * @param segmentId - The segment ID to validate
   * @param booking - The booking object containing flight and passenger information
   * @param selectedPassengersByJourney - Map of journey IDs to selected passenger reference IDs
   * @returns True if all selected passengers for this segment have overbooked or standby status
   */
  public selectedPaxHasOverbookOrStandByStatusForSegment(
    segmentId: string,
    booking: Booking | null,
    selectedPassengersByJourney: SelectedPassengersByJourney | null
  ): boolean {
    if (!booking || !selectedPassengersByJourney || !segmentId) {
      return false;
    }

    const journey = booking.journeys.find((j) => j.segments?.some((s) => s.id === segmentId));
    if (!journey) {
      return false;
    }

    const selectedPassengerIds = selectedPassengersByJourney[journey.id];
    if (!selectedPassengerIds || selectedPassengerIds.length === 0) {
      return false;
    }
    const passengersReferenceIds = new Set(selectedPassengerIds);
    const paxList = booking.pax.filter((pax) => passengersReferenceIds.has(pax.referenceId || ''));

    if (paxList.length === 0) {
      return false;
    }

    return paxList.every((pax) => {
      const segmentInfo = pax.segmentsInfo?.find((info) => info.segmentId === segmentId);

      if (!segmentInfo) {
        return false;
      }

      return (
        segmentInfo.status === PaxSegmentCheckinStatus.OVERBOOKED ||
        segmentInfo.status === PaxSegmentCheckinStatus.STAND_BY
      );
    });
  }

  /**
   * Checks if every selected passenger has overbooked or standby status for all their selected segments.
   *
   * @param booking - The booking object containing flight and passenger information
   * @param selectedPassengersByJourney - Map of journey IDs to selected passenger reference IDs
   * @returns True if all selected passengers have overbooked or standby status
   */
  public everySelectedPaxHasOverbookOrStandByStatus(
    booking: Booking | null,
    selectedPassengersByJourney: SelectedPassengersByJourney | null
  ): boolean {
    if (!booking || !selectedPassengersByJourney) {
      return false;
    }

    const selectedJourneyIds = Object.keys(selectedPassengersByJourney);
    const passengersReferenceIds = new Set(Object.values(selectedPassengersByJourney).flat());
    const paxList = booking.pax.filter((pax) => passengersReferenceIds.has(pax.referenceId || ''));

    const selectedSegments = booking.journeys
      .filter((journey) => selectedJourneyIds.includes(journey.id))
      .flatMap((journey) => journey.segments ?? []);

    return paxList.every((pax) => {
      const segmentsInfo = pax.segmentsInfo?.filter((segmentInfo) =>
        selectedSegments.some((segment) => segment.id === segmentInfo.segmentId)
      );

      if (!segmentsInfo || segmentsInfo.length === 0) {
        return false;
      }

      return segmentsInfo.every(
        (segmentInfo) =>
          segmentInfo.status === PaxSegmentCheckinStatus.OVERBOOKED ||
          segmentInfo.status === PaxSegmentCheckinStatus.STAND_BY
      );
    });
  }
}
