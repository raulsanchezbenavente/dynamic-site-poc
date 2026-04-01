import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { QueryResponse } from '../../CQRS';
import { PaymentStatusResponse } from '../models/dtos/payment-status.response';
import { PaymentStatusQuery } from '../models/requests/payment-status.query';

@Injectable({
  providedIn: 'root',
})
export class PaymentStatusService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getPaymentStatus(request: PaymentStatusQuery): Observable<QueryResponse<PaymentStatusResponse>> {
    return this.post(ProductApi.FINANCE, 'payment/status', request);
  }
}
