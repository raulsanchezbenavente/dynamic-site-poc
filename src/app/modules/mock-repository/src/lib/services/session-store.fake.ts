/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import type { Booking, IbeFlow, SessionData, SessionResponse } from '@dcx/ui/libs';
import { CLEAN_SESSION_DATA } from '@dcx/ui/libs';
import { BehaviorSubject, delay, filter, Observable, of } from 'rxjs';

import { BOOKING_FAKE } from '../models/booking-fake';

export class SessionStoreFake {
  public INITIAL_SESSION_DATA!: SessionData;
  public sessionData$: Observable<SessionData> = new Observable();
  protected sessionDataSubject: BehaviorSubject<SessionData>;

  constructor() {
    this.INITIAL_SESSION_DATA = Object.assign({}, CLEAN_SESSION_DATA);

    this.sessionDataSubject = new BehaviorSubject<SessionData>(this.INITIAL_SESSION_DATA);
    this.sessionData$ = this.sessionDataSubject.asObservable().pipe(filter((session) => !!session));
  }

  public setSessionData(data: SessionData): void {
    throw new Error('Method not implemented.');
  }

  public initSession(): Promise<SessionResponse | undefined> {
    throw new Error('Method not implemented.');
  }

  public getSession(): SessionData {
    const sessionData: SessionData = {
      session: {
        booking: BOOKING_FAKE,
        culture: 'en-US',
        originalBooking: undefined!,
        accountProfileStatus: {
          accountPassengerList: [],
          accountPassengerSelected: [],
        },
      },
    };
    return sessionData;
  }

  public getApiSession(): Observable<SessionData> {
    return new Observable<SessionData>((subscriber) => {
      subscriber.next(this.getSession());
      subscriber.complete();
    }).pipe(delay(1000));
  }

  public resetApiSession(): Observable<SessionData> {
    throw new Error('Method not implemented.');
  }

  public loadInitSession(): Observable<boolean> {
    return of(true);
  }

  public reloadBooking(booking?: Booking | undefined): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  public resetBooking(): void {
    throw new Error('Method not implemented.');
  }

  public cleanBooking(flow?: IbeFlow | undefined, keepUserAgent?: boolean | undefined): void {
    throw new Error('Method not implemented.');
  }

  public saveSession(session: SessionData): void {
    throw new Error('Method not implemented.');
  }

  public showDeclined(value: boolean): void {
    throw new Error('Method not implemented.');
  }

  public setOriginalBooking(booking: Booking): void {
    throw new Error('Method not implemented.');
  }

  protected getValidSessionData(sessionData: SessionData): SessionData {
    throw new Error('Method not implemented.');
  }
}
