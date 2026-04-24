import { Injectable } from '@angular/core';
import { SegmentsStatusResponse, SegmentStatusDto } from '@dcx/ui/api-layer';
import { SegmentStatus } from '@dcx/ui/libs';

import { CheckInSegmentStatus, SegmentsStatusByJourney } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SegmentStatusMapperService {
  public mapSegmentsStatusByJourney(journeyId: string, response: SegmentsStatusResponse): SegmentsStatusByJourney {
    return {
      journeyId,
      segmentsStatus: response.segments.map((segment) => this.mapCheckInSegmentStatus(segment)),
    };
  }

  private mapCheckInSegmentStatus(segment: SegmentStatusDto): CheckInSegmentStatus {
    return {
      origin: segment.origin,
      destination: segment.destination,
      std: new Date(segment.std),
      etd: new Date(segment.etd),
      atd: new Date(segment.atd),
      sta: new Date(segment.sta),
      eta: new Date(segment.eta),
      ata: new Date(segment.ata),
      stdutc: new Date(segment.stdutc),
      stautc: new Date(segment.stautc),
      atdutc: new Date(segment.atdutc),
      atautc: new Date(segment.atautc),
      status: segment.status as unknown as SegmentStatus,
      duration: segment.duration,
    };
  }
}
