import { inject, Injectable } from '@angular/core';
import { SegmentsStatusQuery, SegmentsStatusService } from '@dcx/ui/api-layer';
import { Booking, JourneyVM, SegmentVM } from '@dcx/ui/libs';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { SegmentsStatusByJourney } from '../../../models';
import { SegmentStatusMapperService } from '../../../services/segment-status-mapper.service';
import { ISegmentsStatusProxyInterface } from '../interfaces/segments-status-proxy.interface';

@Injectable({ providedIn: 'root' })
export class SegmentsStatusProxyService implements ISegmentsStatusProxyInterface {
  private readonly segmentStatusService = inject(SegmentsStatusService);
  private readonly segmentStatusMapperService = inject(SegmentStatusMapperService);

  public getSegmentsStatus(booking: Booking): Observable<SegmentsStatusByJourney[]> {
    const segmentStatusCalls = booking.journeys.map((journey) => this.createSegmentStatusCall(journey.id, journey));

    return forkJoin(segmentStatusCalls);
  }

  private createSegmentStatusCall(journeyId: string, journey: JourneyVM): Observable<SegmentsStatusByJourney> {
    const request = this.buildSegmentsStatusRequest(journey);

    return this.segmentStatusService.getSegmentsStatus(request).pipe(
      map((response) => this.segmentStatusMapperService.mapSegmentsStatusByJourney(journeyId, response.result.data)),
      catchError(() =>
        of({
          journeyId,
          segmentsStatus: [],
        })
      )
    );
  }

  private buildSegmentsStatusRequest(journey: JourneyVM): SegmentsStatusQuery {
    const segmentsData = journey.segments
      .filter((segment: SegmentVM) => segment.origin.iata && segment.destination.iata)
      .map((segment: SegmentVM) => ({
        origin: segment.origin.iata!,
        destination: segment.destination.iata!,
        departureDate: segment.schedule.std,
        transportCarrierCode: segment.transport.carrier.code,
        transportNumber: segment.transport.number,
      }));

    return { segmentsData };
  }
}
