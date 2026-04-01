import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SessionSettingsRequest, SessionSettingsResponse } from '../../api-models';
import { BUSINESS_CONFIG } from '../../injection-tokens';
import { BusinessConfig } from '../../model';

@Injectable({ providedIn: 'root' })
export class SessionSettingsService {
  public sessionSettingsData$: BehaviorSubject<SessionSettingsResponse> = new BehaviorSubject(
    {} as SessionSettingsResponse
  );

  constructor(
    protected http: HttpClient,
    @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig
  ) {}

  getSessionSettings(request: SessionSettingsRequest): Observable<SessionSettingsResponse> {
    const httpParams: any = {};
    if (request.latitude && request.longitude) {
      httpParams['latitude'] = request.latitude;
      httpParams['longitude'] = request.longitude;
    }

    return this.http.get<SessionSettingsResponse>(this.businessConfig.apiURLAccounts + '/sessionSettings', {
      params: httpParams,
    });
  }

  updateSessionSettingsData(data: SessionSettingsResponse) {
    this.sessionSettingsData$.next(data);
  }
}
