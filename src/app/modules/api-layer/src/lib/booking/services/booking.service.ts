import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { CreateBookingCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class BookingService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Creates a new booking.
   * @param command The object containing the details of the booking to be created.
   */
  public createBooking(command: CreateBookingCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/booking', command);
  }

  /**
   * Updates the current session booking.
   * Also known as Commit Booking. It performs the Save operation for both regular and disrupted bookings.
   */
  public commitBooking(verificationToken?: string): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.BOOKING, '/booking', verificationToken);
  }

  /**
   * Deletes the current booking from the session.
   */
  public deleteBooking(): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.BOOKING, '/booking');
  }
}
