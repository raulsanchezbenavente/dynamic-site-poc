import type { IbeEvent } from '@dcx/ui/libs';
import { IbeEventTypeEnum } from '@dcx/ui/libs';
import type { Observable } from 'rxjs';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class EventBusServiceFake {
  isRedirecting: boolean = false;

  private eventNotifierSubject: BehaviorSubject<IbeEvent> = new BehaviorSubject({
    type: IbeEventTypeEnum.undefined,
    key: '',
    payload: '',
    page: '',
  } as any);

  eventNotifier$: Observable<IbeEvent> = this.eventNotifierSubject.asObservable();

  notifyEvent(ibeEvent: IbeEvent) {
    if (ibeEvent.type === IbeEventTypeEnum.pageRedirected) {
      this.isRedirecting = true;
    }
    this.eventNotifierSubject.next(ibeEvent);
  }
}
