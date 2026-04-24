import type { ApiResponse, SessionResponse } from '@dcx/ui/libs';
import type { Observable } from 'rxjs';

export class SessionHttpServiceFake {
  AccountSession(): Observable<SessionResponse> {
    throw new Error('Method not implemented.');
  }

  GetSession(): Observable<SessionResponse> {
    throw new Error('Method not implemented.');
  }

  ReloadSession(): Observable<ApiResponse> {
    throw new Error('Method not implemented.');
  }

  CleanSession(): Observable<ApiResponse> {
    throw new Error('Method not implemented.');
  }
}
