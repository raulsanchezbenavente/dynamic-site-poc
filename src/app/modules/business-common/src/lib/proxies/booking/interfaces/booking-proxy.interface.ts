import { Booking } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { SendCheckinRequest } from '../models/send-checkin-request.model';

export interface IBookingProxyInterface {
  getBooking(): Observable<Booking>;
  sendCheckin(request: SendCheckinRequest): Observable<void>;
  reloadBooking(): Observable<void>;
}
