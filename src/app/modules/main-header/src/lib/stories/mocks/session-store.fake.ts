import type {
  AccountData,
  Booking,
  IbeEventTypeEnum,
  IbeFlow,
  Payment,
  ScheduleSelection,
  SearchedJourney,
  SegmentWithSelectedPassengers,
  Service,
  SessionData,
  SessionResponse,
} from '@dcx/ui/libs';
import { PaxTypeCode } from '@dcx/ui/libs';
import { Observable, of } from 'rxjs';

export class SessionStoreFake {
  sessionData$: Observable<SessionData> = new Observable();

  setSessionData(data: SessionData): void {
    throw new Error('Method not implemented.');
  }
  initSession(): Promise<SessionResponse | undefined> {
    throw new Error('Method not implemented.');
  }
  getSession(): SessionData {
    const sessionData: SessionData = {
      session: {
        booking: {
          bookingInfo: {
            recordLocator: 'recordLocator',
            createdDate: 'createdDate',
            status: 'status',
            comments: [],
            queues: [],
            pointOfSale: {
              agent: {
                id: 'id',
              },
              organization: {
                id: 'id',
              },
            },
          },
          pax: [
            {
              type: {
                code: PaxTypeCode.ADT,
              },
              id: 'id',
              name: {
                first: 'firstName',
              },
            },
            {
              type: {
                code: PaxTypeCode.CHD,
              },
              id: 'id',
              name: {
                first: 'firstName',
              },
            },
            {
              type: {
                code: PaxTypeCode.CHD,
              },
              id: 'id',
              name: {
                first: 'firstName',
              },
            },
          ],
          journeys: [],
          payments: [],
          contacts: [],
          services: [],
          pricing: {
            totalAmount: 0,
            balanceDue: 0,
            isBalanced: true,
            currency: 'currency',
            breakdown: {
              perBooking: [],
              perPax: [
                {
                  paxId: 'paxId',
                  referenceId: 'referenceId',
                  sellKey: 'sellKey',
                  totalAmount: 0,
                  currency: 'currency',
                  charges: [],
                },
              ],
              perPaxSegment: [],
              perSegment: [],
              perPaxJourney: [],
            },
          },
        }!,
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
  getApiSession(): Observable<SessionData> {
    throw new Error('Method not implemented.');
  }
  resetApiSession(): Observable<SessionData> {
    throw new Error('Method not implemented.');
  }
  loadInitSession(): Observable<boolean> {
    return of(true);
  }
  reloadBooking(booking?: Booking | undefined): Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  resetBooking(): void {
    throw new Error('Method not implemented.');
  }
  cleanBooking(flow?: IbeFlow | undefined, keepUserAgent?: boolean | undefined): void {
    throw new Error('Method not implemented.');
  }
  saveSession(session: SessionData): void {
    throw new Error('Method not implemented.');
  }
  showDeclined(value: boolean): void {
    throw new Error('Method not implemented.');
  }
  setOriginalBooking(booking: Booking): void {
    throw new Error('Method not implemented.');
  }
  protected getValidSessionData(sessionData: SessionData): SessionData {
    throw new Error('Method not implemented.');
  }
}
