import { inject, Injectable } from '@angular/core';
import { SessionService } from '@dcx/ui/api-layer';
import { Booking } from '@dcx/ui/libs';
import { map, Observable } from 'rxjs';

import { BookingDtoMapperService } from '../../../services/booking-dto-mapper.service';
import { ISessionEventProxyInterface } from '../interfaces/session-event-proxy.interface';

@Injectable({ providedIn: 'root' })
export class SessionEventProxyService implements ISessionEventProxyInterface {
  private readonly sessionService = inject(SessionService);
  private readonly bookingMapperService = inject(BookingDtoMapperService);

  public getSessionEventBooking(): Observable<Booking> {
    return this.sessionService
      .retrieveSessionEvent()
      .pipe(map((response) => this.bookingMapperService.mapBooking(response.result.data)));
  }
}
