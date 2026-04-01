import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { EventBusService, LoggerService } from '../../core';
import { SessionResponse } from '../api-models';
import { BUSINESS_CONFIG } from '../injection-tokens';
import { Booking, BusinessConfig, IbeFlow } from '../model';
import { StorageService } from '../services/storage.service';

import { SessionHttpService } from './session-http.service';
import { CLEAN_BOOKING, CLEAN_PROFILE_STATUS, CLEAN_SESSION_DATA, SessionData } from './session.data';

/**
 * Session Store Service -  should be focused only for Booking Flow
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  public INITIAL_SESSION_DATA: SessionData;

  protected sessionDataSubject: BehaviorSubject<SessionData>;
  public sessionData$: Observable<SessionData>;

  constructor(
    protected storageService: StorageService,
    protected sessionHttpService: SessionHttpService,
    protected eventBusService: EventBusService,
    protected loggerService: LoggerService,
    @Optional() @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig
  ) {
    this.INITIAL_SESSION_DATA = this.storageService.getSessionStorage(businessConfig.sessionKey!)
      ? this.storageService.getSessionStorage(businessConfig.sessionKey!)
      : { ...CLEAN_SESSION_DATA };

    this.sessionDataSubject = new BehaviorSubject<SessionData>(this.INITIAL_SESSION_DATA);
    this.sessionData$ = this.sessionDataSubject.asObservable().pipe(filter((session) => !!session));
  }

  public setSessionData(data: SessionData): void {
    this.sessionDataSubject.next(data);
  }

  public initSession(): Promise<SessionResponse> {
    return firstValueFrom(this.sessionHttpService.GetSession());
  }

  public getSession(): SessionData {
    return this.sessionDataSubject.getValue();
  }

  public getApiSession(): Observable<SessionData> {
    return new Observable((observer) => {
      this.sessionHttpService.GetSession().subscribe({
        next: (res) => {
          let currentSession = this.sessionDataSubject.getValue();

          currentSession = this.getValidSessionData(currentSession);
          if (res.result?.data) {
            currentSession.session.booking = res.result.data;
          }

          this.saveSession(currentSession);
          this.sessionDataSubject.next(currentSession);
          observer.next(this.getSession());
        },
        error: (e) => {
          this.loggerService.error('SessionService', 'No session', e);
          observer.next(this.getSession());
        },
        complete: () => {},
      });
    });
  }

  /**
   * Reset api session and get the new session
   */
  public resetApiSession(): Observable<SessionData> {
    return new Observable((observer) => {
      this.sessionHttpService.ReloadSession().subscribe({
        next: (resetResponse) => {
          if (!resetResponse.success) {
            this.loggerService.error('SessionService', 'No reset the session');
            observer.error(resetResponse.errors);
            return;
          }

          this.getApiSession().subscribe((res) => {
            observer.next(res);
          });
        },
        error: (e) => {
          this.loggerService.error('SessionService', 'No session');
          observer.error(e);
        },
        complete: () => {},
      });
    });
  }

  public loadInitSession(): Observable<boolean> {
    return new Observable((observer) => {
      this.initSession()
        .catch((e) => {
          observer.error(e);
        })
        .then((res) => {
          if (res) {
            this.reloadBooking(res.result!.data)
              .pipe(take(1))
              .subscribe({
                next: (response) => {
                  observer.next(response);
                },
                error: (error) => {
                  observer.error(error);
                },
              });
          }
        })
        .catch((e) => {
          observer.error(e);
        });
    });
  }

  // Should be called ReloadApiSession
  public reloadBooking(booking?: Booking): Observable<boolean> {
    return new Observable((observer) => {
      if (booking) {
        let currentSession = this.sessionDataSubject.getValue();

        currentSession = this.getValidSessionData(currentSession);

        currentSession.session.booking = booking;

        this.saveSession(currentSession);
        this.sessionDataSubject.next(currentSession);
        observer.next(true);
        return;
      }
      this.sessionHttpService.GetSession().subscribe({
        next: (res) => {
          let currentSession = this.sessionDataSubject.getValue();

          currentSession = this.getValidSessionData(currentSession);

          currentSession.session.booking = res.result!.data;

          this.saveSession(currentSession);
          this.sessionDataSubject.next(currentSession);
          observer.next(true);
        },
        error: (e) => {
          this.loggerService.error('SessionService', 'No session', e);
          observer.next(false);
        },
      });
    });
  }

  public resetBooking(): void {
    let currentSession = this.sessionDataSubject.getValue();

    currentSession = this.getValidSessionData(currentSession);

    currentSession.session.booking = CLEAN_BOOKING;
    currentSession.session.accountProfileStatus = CLEAN_PROFILE_STATUS;

    this.saveSession(currentSession);
    this.sessionDataSubject.next(currentSession);
  }

  public cleanBooking(flow?: IbeFlow, keepUserAgent?: boolean): void {
    const userAgent = keepUserAgent ? this.sessionDataSubject.value.userAgentResponse : undefined;

    const sessionData = { ...CLEAN_SESSION_DATA };
    sessionData.userAgentResponse = userAgent;
    if (flow) {
      sessionData.session.flow = flow;
    }

    this.saveSession(sessionData);

    this.sessionDataSubject.next(sessionData);
  }

  public saveSession(session: SessionData): void {
    this.storageService.setSessionStorage(
      this.businessConfig.sessionKey!,
      session,
      this.businessConfig.timeoutLocalStorage
    );
  }

  public showDeclined(value: boolean): void {
    const sessionData = { ...this.sessionDataSubject.value };
    sessionData.session.showDeclined = value;

    this.saveSession(sessionData);
  }

  /**
   * Set Original booking in session. Used in flow MMB/WCI/Agency
   * @param booking session booking
   */
  public setOriginalBooking(booking: Booking): void {
    const sessionData = { ...this.sessionDataSubject.value };
    sessionData.session.originalBooking = booking;
    this.saveSession(sessionData);
  }

  /**
   * Get valid session data
   * @param sessionData session
   */
  protected getValidSessionData(sessionData: SessionData): SessionData {
    if (!sessionData.session) {
      return { ...CLEAN_SESSION_DATA };
    }
    return sessionData;
  }
}
