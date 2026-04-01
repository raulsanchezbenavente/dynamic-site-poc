import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AddSeatServiceRequest, RemoveSeatServicesCommand, ServicesServiceDto, UpdateSeatServiceCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class SeatService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addSeat(seatService: AddSeatServiceRequest): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.SERVICES, '/service/seat', seatService);
  }

  public updateSeats(command: UpdateSeatServiceCommand): Observable<CommandResponse<ServicesServiceDto[]>> {
    return this.patch(ProductApi.SERVICES, '/service/seat', command);
  }

  public removeSeats(command: RemoveSeatServicesCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.SERVICES, '/service/seat', command);
  }
}
