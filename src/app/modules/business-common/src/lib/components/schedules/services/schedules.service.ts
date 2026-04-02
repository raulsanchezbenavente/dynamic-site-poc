import { Injectable } from '@angular/core';
import { convertDateToIso8601, getDiffDays, JourneyVM } from '@dcx/ui/libs';
import dayjs from 'dayjs';

import { LegsDetails } from '../components/atoms/legs-details/models/legs-details.config';

export interface ScheduleTimeComparison {
  scheduled: string;
  estimated: string;
  actual: string;
  hasChanged: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  /**
   * Calculates the total number of days between journey departure and arrival.
   * Uses actual or estimated arrival time if available, otherwise falls back to scheduled.
   */
  public getTotalDays(journey: JourneyVM): number {
    // Get the departure date of the first segment
    const firstDay = convertDateToIso8601(journey.schedule.std);

    // Get the last segment and its last leg
    const lastSegment = journey.segments?.at(-1);
    const lastLeg = lastSegment?.legs?.at(-1);

    // Get the fallback scheduled arrival date
    const fallbackDate = lastLeg?.sta ?? journey.schedule.sta;

    // Get estimated and actual arrival times
    const estimated = lastSegment?.schedule.eta;
    const actual = lastSegment?.schedule.ata;

    // Choose the most accurate arrival time available
    const validArrival = actual ?? estimated ?? fallbackDate;
    const lastDay = convertDateToIso8601(validArrival);

    // Return the difference in days between departure and arrival
    return getDiffDays(firstDay, lastDay);
  }

  /**
   * Builds formatted data for rendering journey legs visually.
   */
  public buildLegsDetails(data: JourneyVM): LegsDetails {
    const allLegs = data.segments.flatMap((segment) => segment.legs);
    return {
      model: {
        legs: allLegs,
        stopsNumber: allLegs.length - 1,
        duration: data.duration ?? '',
      },
    };
  }

  /**
   * Returns comparison between scheduled, estimated and actual departure time.
   */
  public getDepartureTimeComparison(journey: JourneyVM): ScheduleTimeComparison {
    const firstSegment = journey.segments?.[0];
    const scheduled = this.formatTime(journey.schedule.std);
    const estimated = this.formatTime(firstSegment?.schedule.etd);
    const actual = this.formatTime(firstSegment?.schedule.atd);

    return {
      scheduled,
      estimated,
      actual,
      hasChanged: this.hasTimeChanged(actual, estimated, scheduled),
    };
  }

  /**
   * Returns comparison between scheduled, estimated and actual arrival time.
   */
  public getArrivalTimeComparison(journey: JourneyVM): ScheduleTimeComparison {
    const lastSegment = journey.segments?.at(-1);
    const scheduled = this.formatTime(journey.schedule.sta);
    const estimated = this.formatTime(lastSegment?.schedule.eta);
    const actual = this.formatTime(lastSegment?.schedule.ata);
    return {
      scheduled,
      estimated,
      actual,
      hasChanged: this.hasTimeChanged(actual, estimated, scheduled),
    };
  }

  /**
   * Determines if the current/estimated time is different from scheduled time.
   */
  private hasTimeChanged(actual: string, estimated: string, scheduled: string): boolean {
    const validTime = actual === '00:00' ? estimated : actual;
    return this.areTimesValid(actual, estimated) && validTime !== scheduled;
  }

  /**
   * Returns time formatted as HH:mm or fallback.
   */
  private formatTime(date?: Date): string {
    return date ? dayjs(date).format('HH:mm') : '00:00';
  }
  /**
   * Validates if the current and estimated times are not both '00:00'.
   */
  private areTimesValid(currentTimeFormat: string, estimatedTimeFormat: string): boolean {
    return currentTimeFormat !== '00:00' || estimatedTimeFormat !== '00:00';
  }
}
