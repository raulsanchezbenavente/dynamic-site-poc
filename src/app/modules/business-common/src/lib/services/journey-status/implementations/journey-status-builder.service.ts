import { Injectable } from '@angular/core';
import { SegmentStatus } from '@dcx/ui/api-layer';
import { JourneyStatus } from '@dcx/ui/libs';

import { SegmentsStatusByJourney } from '../../../models';
import { IJourneyStatusBuilder } from '../interfaces/journey-status-builder.interface';

/**
 * Builds Journey Status based on Segment Status API response.
 *
 * Rules:
 * - Only show status if API responds successfully
 * - For multi-segment journeys, use first enabled segment that has NOT landed
 * - Maps SegmentStatus to JourneyStatus
 */
@Injectable({ providedIn: 'root' })
export class JourneyStatusBuilderService implements IJourneyStatusBuilder {
  /**
   * Determines the journey status based on the Segment Status API response.
   *
   * @param journeyId - The journey identifier
   * @param segmentsStatus - Array of segment statuses by journey from API
   * @returns JourneyStatus or undefined if unavailable/failed
   */
  public getData(journeyId: string, segmentsStatus: SegmentsStatusByJourney[] = []): JourneyStatus | undefined {
    const segmentData = segmentsStatus.find((segment) => segment.journeyId === journeyId);

    // No data from API
    if (!segmentData?.segmentsStatus?.length) {
      return undefined;
    }

    const totalSegments = segmentData.segmentsStatus.length;

    // Single-segment journey: Always show its status (even if LANDED)
    if (totalSegments === 1) {
      return this.mapSegmentStatusToJourneyStatus(segmentData.segmentsStatus[0].status);
    }

    // Multi-segment journey: Find first segment that has NOT landed
    const activeSegment = segmentData.segmentsStatus.find((segment) => segment.status !== SegmentStatus.LANDED);

    // If all segments landed → show LANDED status
    if (!activeSegment) {
      return JourneyStatus.LANDED;
    }

    // Return status of first non-landed segment
    return this.mapSegmentStatusToJourneyStatus(activeSegment.status);
  }

  /**
   * Maps Segment Status API values to UI Journey Status.
   *
   * Mapping:
   * - OnRoute → ON_ROUTE (Took off)
   * - Diverted → DIVERTED (Diverted)
   * - Delayed → DELAYED (Delayed)
   * - OnTime → ON_TIME (Confirmed)
   * - Landed → LANDED (Landed)
   * - Cancelled → CANCELLED (Cancelled)
   * - Departed → DEPARTED (Departed)
   * - Returned → RETURNED (Returned)
   * - Closed → CLOSED (Closed)
   * - Open → OPEN (Open)
   *
   * @param status - The segment status from API
   * @returns Corresponding JourneyStatus or undefined if no mapping exists
   */
  private mapSegmentStatusToJourneyStatus(status: SegmentStatus): JourneyStatus | undefined {
    const statusMap: Partial<Record<SegmentStatus, JourneyStatus>> = {
      [SegmentStatus.ON_ROUTE]: JourneyStatus.ON_ROUTE,
      [SegmentStatus.DIVERTED]: JourneyStatus.DIVERTED,
      [SegmentStatus.DELAYED]: JourneyStatus.DELAYED,
      [SegmentStatus.ON_TIME]: JourneyStatus.ON_TIME,
      [SegmentStatus.LANDED]: JourneyStatus.LANDED,
      [SegmentStatus.CANCELLED]: JourneyStatus.CANCELLED,
      [SegmentStatus.DEPARTED]: JourneyStatus.DEPARTED,
      [SegmentStatus.RETURNED]: JourneyStatus.RETURNED,
      [SegmentStatus.CLOSED]: JourneyStatus.CLOSED,
      [SegmentStatus.OPEN]: JourneyStatus.OPEN,
    };

    return statusMap[status];
  }
}
