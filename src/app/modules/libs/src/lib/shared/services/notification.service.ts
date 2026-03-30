import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { EventBusService } from '../../core/lib/event-bus.service';
import { RedirectService } from '../../core/services/redirect.service';

export type NotificationConfigModel = {
  title?: string;
  message?: string;
  buttonPrimaryUrl?: string;
  buttonPrimaryCallBack?: () => void;
  buttonSecondaryCallBack?: () => void;
  onBlurCallback?: () => void;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public openDialogSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openDialog$: Observable<boolean> = this.openDialogSubject.asObservable();
  private readonly notificationConfig: Subject<NotificationConfigModel> = new Subject();
  public notificationConfig$: Observable<NotificationConfigModel> = this.notificationConfig.asObservable();

  constructor(
    protected eventBusService: EventBusService,
    protected redirectService: RedirectService
  ) {
    void this.eventBusService;
    void this.redirectService;
  }

  public showNotification(config: NotificationConfigModel): void {
    this.notificationConfig.next(config);
    this.openDialogSubject.next(true);
  }

  public openModalTimeOut(callBack: () => void, _callBackSecondary: () => void): void {
    callBack();
  }
}
