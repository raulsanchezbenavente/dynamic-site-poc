import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { IbeEvent } from '../models/ibe-event';
import { IbeEventTypeEnum } from '../models/ibe-event-type';
import { ConfigService } from '../services';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  public isRedirecting: boolean;
  public eventNotifier$: Observable<IbeEvent>;
  private readonly eventNotifierSubject: BehaviorSubject<IbeEvent>;
  private readonly _generalNotifierChannel: BroadcastChannel;
  private readonly _generalListenerChannel: BroadcastChannel;

  constructor(private readonly config: ConfigService) {
    console.debug(config);
    this._generalNotifierChannel = new BroadcastChannel('IBEChannel_' + this.config.getInstanceId());
    this._generalListenerChannel = new BroadcastChannel('IBEChannel_' + this.config.getInstanceId());

    this._generalListenerChannel.onmessage = (event): void => {
      this.eventNotifierSubject.next(event.data);
    };

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
    this._generalNotifierChannel.postMessage(ibeEvent);
  }
}
