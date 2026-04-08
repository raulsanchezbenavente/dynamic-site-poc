import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SessionService } from '@dcx/ui/business-common';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RetrieveServicePricingQuery, ServiceDto } from '..';
import { QueryResponse } from '../../CQRS';

import { ServicesMockService } from './services-mock.service';

@Injectable({
  providedIn: 'root',
})
export class ServicesService extends HttpClientService {
  private readonly sessionService = inject(SessionService);
  private readonly servicesMockService = inject(ServicesMockService);

  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getServices(request: RetrieveServicePricingQuery): Observable<QueryResponse<ServiceDto[]>> {
    const booking = this.sessionService.getBookingFromStorage();

    return this.post<RetrieveServicePricingQuery, QueryResponse<ServiceDto[]>>(
      ProductApi.PRICING,
      '/services',
      request
    ).pipe(
      map((response: QueryResponse<ServiceDto[]>) => {
        if (!booking) {
          return response;
        }

        const mockServices = this.servicesMockService.generateMockServices(booking);

        if (!mockServices.length) {
          return response;
        }

        return {
          ...response,
          result: {
            ...response.result,
            data: [...(response.result?.data || []), ...mockServices],
          },
        };
      })
    );
  }
}
