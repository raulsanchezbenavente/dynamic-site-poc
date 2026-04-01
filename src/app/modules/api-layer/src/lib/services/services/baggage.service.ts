import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { ConfirmBaggageCommand, UnconfirmBaggageCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class BaggageService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public confirmBaggage(command: ConfirmBaggageCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.SERVICES, '/baggage/confirm', command);
  }

  public unconfirmBaggage(command: UnconfirmBaggageCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.SERVICES, '/baggage/unconfirm', command);
  }
}
