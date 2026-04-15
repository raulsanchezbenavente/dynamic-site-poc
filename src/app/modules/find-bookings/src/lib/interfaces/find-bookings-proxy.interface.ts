import { Observable } from 'rxjs';

import { CommandResponse, VoidCommandResponse } from '../../../../api-layer/src/lib/CQRS';
import { AddBookingRequestDto, FindBookingsResponse } from '../api-models/find-bookings-response.model';

export interface IFindBookingsProxyService {
  getBookings(): Observable<FindBookingsResponse>;
  addBooking(add: AddBookingRequestDto): Observable<CommandResponse<VoidCommandResponse>>;
}
