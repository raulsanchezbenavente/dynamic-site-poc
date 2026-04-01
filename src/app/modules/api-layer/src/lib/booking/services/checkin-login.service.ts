import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ConfigService,
  EnumStorageKey,
  HttpClientService,
  IdleTimeoutService,
  ProductApi,
  StorageService,
} from '@dcx/ui/libs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LoginBookingCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class CheckinService extends HttpClientService {
  private readonly storageService = inject(StorageService);

  constructor() {
    super(inject(HttpClient), inject(IdleTimeoutService), inject(ConfigService));
  }

  public loginByRecordLocator(query: LoginBookingCommand): Observable<CommandResponse<VoidCommandResponse>> {
    const endpointConfig = this.configService.getEndpointsConfig();
    const url = `${endpointConfig.apiURLBooking}/booking/checkin`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });

    return this.httpClient
      .post<CommandResponse<VoidCommandResponse>>(url, query, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<CommandResponse<VoidCommandResponse>>) => {
          const responseHeaders = response.headers;
          this.storageService.setSessionStorage(EnumStorageKey.SessionRef, responseHeaders.get('sessionref') || '');
          return response.body as CommandResponse<VoidCommandResponse>;
        })
      );
  }

  public loginByJourneyDetails(query: LoginBookingCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, 'booking/checkindetails', query);
  }

  public loginByThirdPartyRecordLocator(query: LoginBookingCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, 'booking/checkinthirdparty', query);
  }
}
