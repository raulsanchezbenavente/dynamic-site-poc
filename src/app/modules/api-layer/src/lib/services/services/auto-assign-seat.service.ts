import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AutoAssign, AutoAssignSeatQuery } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class AutoAssignSeatService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public autoAssignSeat(query: AutoAssignSeatQuery): Observable<QueryResponse<AutoAssign[]>> {
    return this.post(ProductApi.SERVICES, '/service/autoassignseat', query);
  }
}
