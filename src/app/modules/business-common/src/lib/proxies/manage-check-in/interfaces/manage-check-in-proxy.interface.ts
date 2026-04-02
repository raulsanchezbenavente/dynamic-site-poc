import { Observable } from 'rxjs';

export interface IManageCheckInProxyInterface {
  getServiceOptions(): Observable<{ option: string }[]>;
}
