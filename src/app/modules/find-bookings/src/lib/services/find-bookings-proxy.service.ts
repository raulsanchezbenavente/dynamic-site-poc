import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { CommandResponse, VoidCommandResponse } from '../../../../api-layer/src/lib/CQRS';
import { AddBookingRequestDto, FindBookingsResponse } from '../api-models/find-bookings-response.model';
import { IFindBookingsProxyService } from '../interfaces/find-bookings-proxy.interface';

@Injectable()
export class FindBookingsProxyService extends HttpClientService implements IFindBookingsProxyService {
  constructor() {
    const httpClient = inject(HttpClient);
    const idleTimeoutService = inject(IdleTimeoutService);
    const configService = inject(ConfigService);
    super(httpClient, idleTimeoutService, configService);
  }

  public getBookings(): Observable<FindBookingsResponse> {
    return this.get(ProductApi.BOOKING, '/booking/findFlights');
  }
  public addBooking(add: AddBookingRequestDto): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/booking/add', add);
  }
}
