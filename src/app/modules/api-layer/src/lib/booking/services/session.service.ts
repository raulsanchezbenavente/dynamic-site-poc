import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { Booking } from '..';
import { QueryResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class SessionService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Retrieves the current Session Booking.
   */
  public getSession(): Observable<QueryResponse<Booking>> {
    return this.get(ProductApi.BOOKING, '/session');
  }

  /**
   * Reloads/Resets the Session Booking.
   */
  public reloadSession(): Observable<VoidCommandResponse> {
    return this.put(ProductApi.BOOKING, '/session');
  }

  /**
   * Deletes the Session Booking and ends the session flow.
   */
  public clearSession(): Observable<VoidCommandResponse> {
    return this.delete(ProductApi.BOOKING, '/session');
  }

  public retrieveSessionEvent(): Observable<QueryResponse<Booking>> {
    return this.get(ProductApi.BOOKING, 'booking/sessionEvent');
  }
}
