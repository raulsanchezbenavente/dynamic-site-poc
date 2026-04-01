import { SessionSettingsRequest, SessionSettingsResponse } from '@dcx/ui/libs';
import { BehaviorSubject, Observable, of } from 'rxjs';

export class SessionSettingsServiceFake {
  public sessionSettingsData$: BehaviorSubject<SessionSettingsResponse> = new BehaviorSubject({
    response: {
      currency: {
        value: '10000',
      },
      search: {
        origin: 'US',
      },
      source: 'US',
    },
    success: true,
  } as SessionSettingsResponse);

  getSessionSettings(request: SessionSettingsRequest): Observable<SessionSettingsResponse> {
    const httpParams: any = {};
    if (request.latitude && request.longitude) {
      httpParams['latitude'] = request.latitude;
      httpParams['longitude'] = request.longitude;
    }

    return of({} as SessionSettingsResponse);
  }

  updateSessionSettingsData(data: SessionSettingsResponse) {
    this.sessionSettingsData$.next(data);
  }
}
