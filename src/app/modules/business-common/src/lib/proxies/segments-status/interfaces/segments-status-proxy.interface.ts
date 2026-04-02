import { Booking } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { SegmentsStatusByJourney } from '../../../models';

export interface ISegmentsStatusProxyInterface {
  getSegmentsStatus(booking: Booking): Observable<SegmentsStatusByJourney[]>;
}
