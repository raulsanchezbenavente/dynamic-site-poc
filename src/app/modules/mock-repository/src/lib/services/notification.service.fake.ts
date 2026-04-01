import { BehaviorSubject } from 'rxjs';
import type { Observable } from 'rxjs';

export class NotificationServiceFake {
  protected isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  protected isLoading$: Observable<boolean> = this.isLoading.asObservable();

  public showLoader(value: boolean): void {
    this.isLoading.next(value);
  }
}
