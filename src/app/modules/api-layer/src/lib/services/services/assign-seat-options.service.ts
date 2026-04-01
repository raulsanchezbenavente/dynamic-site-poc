import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AssignSeatOption } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class AssignSeatOptionsService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getAssignSeatOptions(): Observable<QueryResponse<AssignSeatOption[]>> {
    return this.get(ProductApi.SERVICES, '/service/assignseatoptions');
  }
}
