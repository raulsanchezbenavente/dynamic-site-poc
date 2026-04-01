import { QueryResponse, SegmentsStatusResponse } from '@dcx/ui/api-layer';
import { Observable } from 'rxjs';

import { fakeSegmentsStatus } from '../models/check-in-summary/segments-status.fake';

export class SegmentsStatusServiceFake {
  public getSegmentsStatus(): Observable<QueryResponse<SegmentsStatusResponse>> {
    return new Observable<QueryResponse<SegmentsStatusResponse>>((subscriber) => {
      subscriber.next({
        result: {
          data: {
            requestDate: new Date(),
            segments: fakeSegmentsStatus,
          },
        },
        success: true,
      });
      subscriber.complete();
    });
  }

  // !! Use the following method if you want to simulate an error
  // public getSegmentsStatus(): Observable<QueryResponse<SegmentsStatusResponse>> {
  //   return throwError(() => new Error('Segments status service unavailable'));
  // }
}
