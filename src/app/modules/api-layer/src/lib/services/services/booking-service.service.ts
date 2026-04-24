import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AddServicesCommand, RemoveServicesCommand, UpdateServiceCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class BookingServiceService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addServices(command: AddServicesCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.SERVICES, '/service', command);
  }

  public updateService(command: UpdateServiceCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.SERVICES, '/service', command);
  }

  public removeServices(command: RemoveServicesCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.SERVICES, '/service', command);
  }
}
