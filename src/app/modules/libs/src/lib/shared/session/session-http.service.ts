import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService, IdleTimeoutService } from '../../core';
import { ApiResponse, SessionResponse } from '../api-models';
import { httpOptions } from '../helpers';

@Injectable({ providedIn: 'root' })
export class SessionHttpService {
  constructor(
    protected http: HttpClient,
    protected idleTimeoutService: IdleTimeoutService,
    protected configService: ConfigService
  ) {}

  AccountSession(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(
      this.configService.getEndpointsConfig().apiURLAccounts + '/session',
      httpOptions
    );
  }

  GetSession(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(this.configService.getEndpointsConfig().apiURLBooking + '/booking/session');
  }

  ReloadSession(): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(this.configService.getEndpointsConfig().apiURLBooking + '/booking/session', {});
  }

  CleanSession(): Observable<ApiResponse> {
    return this.http.request<ApiResponse>(
      'delete',
      this.configService.getEndpointsConfig().apiURLBooking + '/booking/session',
      {
        body: {},
        withCredentials: true,
      }
    );
  }
}
