import { inject, Injectable } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';

import { EXCLUDE_SESSION_EXPIRED_URLS, NotificationService, TIMEOUT_REDIRECT } from '../../shared';
import { TIME_ALERT_EXPIRED_SESSION, TIME_EXPIRED_SESSION } from '../injection-tokens/injectiontokens';
import { IbeEventRedirectType } from '../models';

import { RedirectionService } from './redirection.service';

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {
  private timerSubscriptionShow!: Subscription;
  private timerSubscriptionExpired!: Subscription;
  private timerShow!: Observable<number>;
  private timerExpired!: Observable<number>;
  private readonly globalUrl = this.getFormattedPath(globalThis.location.pathname);
  private readonly isCorporate = document.querySelectorAll('[corporate]').length > 0;
  public timeoutExpiredShow: Subject<number> = new Subject<number>();
  public timeoutTotalExpired: Subject<number> = new Subject<number>();
  private readonly notificationService = inject(NotificationService);
  private readonly redirectService = inject(RedirectionService);
  private readonly excludedSessionExpiredUrls: string[] = inject(EXCLUDE_SESSION_EXPIRED_URLS);
  private readonly timeOutRedirect: string = inject(TIMEOUT_REDIRECT);
  private readonly timeAlertExpiredSession: number = inject(TIME_ALERT_EXPIRED_SESSION);
  private readonly timeExpiredSession: number = inject(TIME_EXPIRED_SESSION);
  constructor() {
    this.startTimer();
  }
  public stopTimer(): void {
    this.timerSubscriptionShow.unsubscribe();
    this.timerSubscriptionExpired.unsubscribe();
  }

  public resetTimer(): void {
    if (this.timerSubscriptionShow) {
      this.timerSubscriptionShow.unsubscribe();
    }

    if (this.timerSubscriptionExpired) {
      this.timerSubscriptionExpired.unsubscribe();
    }

    this.timerShow = timer(this.timeAlertExpiredSession);
    this.timerSubscriptionShow = this.timerShow.subscribe(() => {
      this.timeoutExpiredShowHandler();
    });

    this.timerExpired = timer(this.timeExpiredSession);
    this.timerSubscriptionExpired = this.timerExpired.subscribe(() => {
      this.timeoutTotalExpiredHandler();
    });
  }

  private startTimer(): void {
    if (this.timerSubscriptionShow) {
      this.timerSubscriptionShow.unsubscribe();
      this.timerSubscriptionExpired.unsubscribe();
    }

    this.timerShow = timer(this.timeAlertExpiredSession);
    this.timerSubscriptionShow = this.timerShow.subscribe(() => {
      this.timeoutExpiredShowHandler();
    });

    this.timerExpired = timer(this.timeExpiredSession);
    this.timerSubscriptionExpired = this.timerExpired.subscribe(() => {
      this.timeoutTotalExpiredHandler();
    });
  }

  private timeoutExpiredShowHandler(): void {
    if (!this.isUrlExcluded()) {
      this.notificationService.openModalTimeOut(
        () => this.resetTimer(),
        () => this.timeoutTotalExpiredHandler()
      );
    }
  }

  private timeoutTotalExpiredHandler(): void {
    if (!this.isUrlExcluded()) {
      this.redirectService.redirect(IbeEventRedirectType.internalRedirect, this.timeOutRedirect ?? '/');
    }
  }

  private getFormattedPath(path: string): string {
    return path.endsWith('/') ? path : path + '/';
  }

  private isUrlExcluded(): boolean {
    return (
      this.globalUrl === '/' ||
      this.isCorporate ||
      this.excludedSessionExpiredUrls.some((excludedUrl) => this.globalUrl.includes(excludedUrl))
    );
  }
}
