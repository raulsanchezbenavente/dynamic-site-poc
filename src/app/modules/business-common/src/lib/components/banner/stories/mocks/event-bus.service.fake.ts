import type { IbeEvent } from '@dcx/ui/libs';
import { IbeEventTypeEnum } from '@dcx/ui/libs';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import type { Observable } from 'rxjs';

export class EventBusServiceFake {
  public isRedirecting = false;

  private eventNotifierSubject: BehaviorSubject<IbeEvent> = new BehaviorSubject({
    type: IbeEventTypeEnum.undefined,
    key: '',
    payload: '',
    page: '',
  } as any);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public eventNotifier$: Observable<IbeEvent> = this.eventNotifierSubject.asObservable().pipe(distinctUntilChanged());

  public notifyEvent(ibeEvent: IbeEvent): void {
    if (ibeEvent.type === IbeEventTypeEnum.pageRedirected) {
      this.isRedirecting = true;
    }
    this.eventNotifierSubject.next(ibeEvent);
  }
}
