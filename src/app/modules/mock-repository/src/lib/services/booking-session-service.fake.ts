import { Booking, CommandResponse, VoidCommandResponse } from '@dcx/ui/api-layer';
import { Observable } from 'rxjs';

import { fakeSession } from '../models/check-in-summary/booking-session.fake';

export class BookingSessionServiceFake {
  public getBooking(): Observable<CommandResponse<Booking>> {
    return new Observable<CommandResponse<Booking>>((subscriber) => {
      subscriber.next({
        result: {
          data: fakeSession as unknown as Booking,
        },
        success: true,
      });
      subscriber.complete();
    });
  }

  public reloadBooking(): Observable<CommandResponse<VoidCommandResponse>> {
    return new Observable<CommandResponse<VoidCommandResponse>>((subscriber) => {
      subscriber.next({
        result: {
          data: fakeSession as VoidCommandResponse,
        },
        success: true,
      });
      subscriber.complete();
    });
  }

  public clearBooking(): Observable<CommandResponse<VoidCommandResponse>> {
    return new Observable<CommandResponse<VoidCommandResponse>>((subscriber) => {
      subscriber.next({
        result: {
          data: {} as VoidCommandResponse,
        },
        success: true,
      });
      subscriber.complete();
    });
  }
}
