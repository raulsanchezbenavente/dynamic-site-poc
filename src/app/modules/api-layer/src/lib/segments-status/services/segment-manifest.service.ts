import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { RetrieveSegmentManifestQuery, SegmentManifestDto } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class SegmentManifestService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getSegmentManifest(query: RetrieveSegmentManifestQuery): Observable<QueryResponse<SegmentManifestDto>> {
    return this.post(ProductApi.SEGMENT_STATUS, '/segmentmanifest', query);
  }
}
