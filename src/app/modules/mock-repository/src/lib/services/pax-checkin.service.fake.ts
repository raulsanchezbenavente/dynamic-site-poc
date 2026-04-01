import { QueryResponse, SegmentCheckIn } from '@dcx/ui/api-layer';
import { Observable } from 'rxjs';

import { fakeSegmentsCheckinStatus } from '../models/check-in-summary/segments-checkin-status.fake';

export class PaxCheckinServiceFake {
  public getCheckinStatus(): Observable<QueryResponse<SegmentCheckIn[]>> {
    return new Observable<QueryResponse<SegmentCheckIn[]>>((subscriber) => {
      subscriber.next({
        result: {
          data: fakeSegmentsCheckinStatus,
        },
        success: true,
      });
      subscriber.complete();
    });
  }
}
