import type { IbeEvent } from '@dcx/ui/libs';
import { IbeEventTypeEnum } from '@dcx/ui/libs';
import type { Observable } from 'rxjs';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class EventBusServiceFake {
  public isRedirecting = false;
  public eventNotifierSubject: BehaviorSubject<IbeEvent>;
  public eventNotifier$: Observable<IbeEvent>;

  constructor() {
    this.eventNotifierSubject = new BehaviorSubject({
      type: IbeEventTypeEnum.undefined,
      key: '',
      payload: '',
      page: '',
    } as any) as BehaviorSubject<IbeEvent>;
    this.eventNotifier$ = this.eventNotifierSubject.asObservable().pipe(distinctUntilChanged());
  }

  public notifyEvent(ibeEvent: IbeEvent): void {
    if (ibeEvent.type === IbeEventTypeEnum.pageRedirected) {
      this.isRedirecting = true;
    }
    this.eventNotifierSubject.next(ibeEvent);
    console.info('EventBusServiceFake', 'NotifyEvent', ibeEvent);
  }
}
