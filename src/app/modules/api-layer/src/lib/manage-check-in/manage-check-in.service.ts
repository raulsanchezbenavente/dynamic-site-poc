import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { QueryResponse } from '../CQRS';

@Injectable({
  providedIn: 'root',
})
export class ManageCheckInService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getServiceOptionManage(): Observable<QueryResponse<{ option: string }[]>> {
    return this.get(ProductApi.BOOKING, 'checkin/managecheckinoptions');
  }
}
