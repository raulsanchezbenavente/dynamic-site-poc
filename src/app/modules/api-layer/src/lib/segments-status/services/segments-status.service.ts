import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { QueryResponse } from '../../CQRS';
import { SegmentsStatusResponse } from '../models/dtos/segments-status-response.dto';
import { SegmentsStatusQuery } from '../models/requests/segments-status-query.request';

@Injectable({
  providedIn: 'root',
})
export class SegmentsStatusService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getSegmentsStatus(query: SegmentsStatusQuery): Observable<QueryResponse<SegmentsStatusResponse>> {
    return this.post(ProductApi.SEGMENT_STATUS, '/segmentsstatus', query);
  }
}
