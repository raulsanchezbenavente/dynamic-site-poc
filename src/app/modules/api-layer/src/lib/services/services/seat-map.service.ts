import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { RetrieveSeatMapQuery, ServicesTransport } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class SeatMapService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getSeatMap(query: RetrieveSeatMapQuery): Observable<QueryResponse<ServicesTransport>> {
    return this.get(ProductApi.SERVICES, '/seatmap', query);
  }
}
