import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AddQueueCommand, RemoveQueueCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class QueueService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addToQueue(command: AddQueueCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/queue', command);
  }

  public removeFromQueue(command: RemoveQueueCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.BOOKING, '/queue', command);
  }
}
