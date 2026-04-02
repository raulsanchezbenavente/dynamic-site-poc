import { inject, Injectable } from '@angular/core';
import { JourneySchedule, JourneyVM, LegVM, SegmentVM } from '@dcx/ui/libs';

import { CheckInSegmentStatus, SegmentsStatusByJourney } from '../../models';
import { JourneyStatusBuilderService } from '../journey-status';

@Injectable({ providedIn: 'root' })
export class JourneyEnricherService {
  private readonly journeyStatusBuilderService = inject(JourneyStatusBuilderService);

  /**
   * Enriches journeys with real-time segment status data.
   *
   * Updates:
   * - Schedules (atd, ata, etd, eta)
   * - IATA codes (for diversions)
   * - Flight status pill
   *
   * @param journeys - Original journeys from booking
   * @param segmentsStatus - Real-time status per journey
   * @returns Enriched journeys with updated data
   */
  public enrichJourneysWithStatus(journeys: JourneyVM[], segmentsStatus: SegmentsStatusByJourney[] = []): JourneyVM[] {
    if (!segmentsStatus?.length) return journeys;

    return journeys.map((journey) => {
      const status = this.journeyStatusBuilderService.getData(journey.id, segmentsStatus);
      const segmentsStatusByJourney = segmentsStatus.find((jr) => jr.journeyId === journey.id);

      const segments = this.mapJourneySegments(journey.segments, segmentsStatusByJourney?.segmentsStatus || []);

      const mappedJourney = {
        ...journey,
        destination: {
          ...journey.destination,
          iataOperation: segments.length > 0 ? segments.at(-1)!.destination.city : journey.destination.city,
        },
        segments,
        status,
      };
      return mappedJourney;
    });
  }

  /**
   * Maps raw segments to `SegmentVM`. Applies real-time status overrides when available; falls back to base schedule.
   * Matching is performed by array index to handle diverted flights correctly.
   */
  private mapJourneySegments(segments: SegmentVM[], segmentsStatus: CheckInSegmentStatus[]): SegmentVM[] {
    return segments.map((segment, index): SegmentVM => {
      const foundStatus = segmentsStatus?.[index];
      const schedule = this.buildSegmentSchedule(segment, foundStatus);
      const { originCity, destinationCity } = this.resolveSegmentCities(segment, foundStatus);
      const legs = this.mapSegmentLegs(segment.legs, schedule, originCity, destinationCity);

      return {
        ...segment,
        origin: {
          ...segment.origin,
          city: originCity,
        },
        destination: {
          ...segment.destination,
          city: destinationCity,
        },
        schedule,
        legs,
      };
    });
  }

  /**
   * Builds the schedule for a segment, prioritizing real-time data from segment status.
   */
  private buildSegmentSchedule(segment: SegmentVM, foundStatus?: CheckInSegmentStatus): JourneySchedule {
    if (!foundStatus) {
      return segment.schedule;
    }

    return {
      ata: foundStatus.ata,
      atd: foundStatus.atd,
      eta: foundStatus.eta,
      std: foundStatus.std,
      etd: foundStatus.etd,
      sta: foundStatus.sta,
      stdutc: foundStatus.stdutc,
      stautc: foundStatus.stautc,
    };
  }

  /**
   * Resolves origin and destination cities, prioritizing segment status (handles diversions).
   */
  private resolveSegmentCities(
    segment: SegmentVM,
    foundStatus?: CheckInSegmentStatus
  ): { originCity: string; destinationCity: string } {
    return {
      originCity: foundStatus?.origin ?? segment.origin.iata!,
      destinationCity: foundStatus?.destination ?? segment.destination.iata!,
    };
  }

  /**
   * Maps legs to `LegVM`, inheriting segment transport and using segment UTC as fallback when leg UTC is missing.
   * Recomputes duration per leg.
   */
  private mapSegmentLegs(
    legs: LegVM[],
    schedule: JourneySchedule,
    originCity: string,
    destinationCity: string
  ): LegVM[] {
    return legs.map((leg: LegVM): LegVM => {
      return {
        ...leg,
        ...schedule,
        origin: originCity,
        destination: destinationCity,
      };
    });
  }
}
