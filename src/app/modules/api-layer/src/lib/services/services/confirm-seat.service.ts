import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { ConfirmSeatServicesCommand, UnconfirmSeatServicesCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class ConfirmSeatService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public confirmSeats(command: ConfirmSeatServicesCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.SERVICES, '/service/confirmseats', command);
  }

  public unconfirmSeats(command: UnconfirmSeatServicesCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.SERVICES, '/service/unconfirmseats', command);
  }
}
