import { HttpClient } from '@angular/common/http';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { JourneyPriceResponse, RetrieveJourneyPricingQuery } from '..';
import { QueryResponse } from '../../CQRS';

export class JourneysService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getJourneys(request: RetrieveJourneyPricingQuery): Observable<QueryResponse<JourneyPriceResponse[]>> {
    return this.get(ProductApi.PRICING, '/journeys', request);
  }
}
