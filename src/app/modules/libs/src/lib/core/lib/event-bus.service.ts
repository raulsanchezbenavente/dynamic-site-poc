import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs';

import { IbeEvent } from '../models/ibe-event';
import { IbeEventTypeEnum } from '../models/ibe-event-type';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  public isRedirecting: boolean;
  public eventNotifier$: Observable<IbeEvent>;
  private readonly eventNotifierSubject: BehaviorSubject<IbeEvent>;

  constructor() {
    this.isRedirecting = false;
    this.eventNotifierSubject = new BehaviorSubject({
      type: IbeEventTypeEnum.undefined,
      key: '',
      payload: '',
      page: '',
    } as IbeEvent);
    this.eventNotifier$ = this.eventNotifierSubject.asObservable().pipe(distinctUntilChanged());
  }

  public notifyEvent(ibeEvent: IbeEvent): void {
    if (ibeEvent.type === IbeEventTypeEnum.pageRedirected) {
      this.isRedirecting = true;
    }
    this.eventNotifierSubject.next(ibeEvent);
  }
}
