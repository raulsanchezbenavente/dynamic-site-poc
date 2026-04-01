import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { ProcessServiceRulesQuery, ServiceRuleResult } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class RulesManagerService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public processServiceRules(query: ProcessServiceRulesQuery): Observable<QueryResponse<ServiceRuleResult[]>> {
    return this.post(ProductApi.RULES_MANAGER, '/services', query);
  }
}
