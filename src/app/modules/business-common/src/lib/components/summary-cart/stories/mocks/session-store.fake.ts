import type { SessionData } from '@dcx/ui/libs';
import { CLEAN_SESSION_DATA } from '@dcx/ui/libs';
import { BOOKING_FAKE } from '@dcx/ui/mock-repository';
import { BehaviorSubject, delay, filter, Observable } from 'rxjs';

export class SessionStoreFake {
  private INITIAL_SESSION_DATA!: SessionData;
  private sessionData$: Observable<SessionData> = new Observable();
  private sessionDataSubject: BehaviorSubject<SessionData>;

  constructor() {
    this.INITIAL_SESSION_DATA = Object.assign({}, CLEAN_SESSION_DATA);

    this.sessionDataSubject = new BehaviorSubject<SessionData>({
      ...this.INITIAL_SESSION_DATA,
      session: {
        ...this.INITIAL_SESSION_DATA.session,
        booking: BOOKING_FAKE,
      },
    });
    this.sessionData$ = this.sessionDataSubject.asObservable().pipe(filter((session) => !!session));
  }

  public getSession(): SessionData {
    return {
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
  }

  public getApiSession(): Observable<SessionData> {
    return new Observable<SessionData>((subscriber) => {
      subscriber.next(this.getSession());
      subscriber.complete();
    }).pipe(delay(1000));
  }
}
