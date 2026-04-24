import { inject, Injectable } from '@angular/core';
import { PaxCheckinService } from '@dcx/ui/api-layer';
import { Booking } from '@dcx/ui/libs';
import { map, Observable } from 'rxjs';

import { BookingDtoMapperService } from '../../../services/booking-dto-mapper.service';
import { SessionService } from '../../../services/session/session.service';
import { IBookingProxyInterface } from '../interfaces/booking-proxy.interface';
import { SendCheckinRequest } from '../models/send-checkin-request.model';

@Injectable({ providedIn: 'root' })
export class BookingProxyService implements IBookingProxyInterface {
  private readonly sessionService = inject(SessionService);
  private readonly bookingMapperService = inject(BookingDtoMapperService);
  private readonly paxCheckinService = inject(PaxCheckinService);

  public getBooking(): Observable<Booking> {
    return this.sessionService
      .getSessionBooking()
      .pipe(map((response) => this.bookingMapperService.mapBooking(response.result.data)));
  }

  public reloadBooking(): Observable<void> {
    return this.sessionService.reloadBookingSession().pipe(map(() => {}));
  }

  public sendCheckin(request: SendCheckinRequest): Observable<void> {
    return this.paxCheckinService.sendCheckin({ ...request }).pipe(map(() => {}));
  }
}
