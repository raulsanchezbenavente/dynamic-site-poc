import { InjectionToken, Provider } from '@angular/core';
import { SharedSessionService } from '@dcx/storybook/business-common';
import {
  BUSINESS_CONFIG,
  type BusinessConfig,
  EnumStorageKey,
  SessionStore,
  type SessionData,
  CLEAN_SESSION_DATA,
  StorageService,
  SeatAssignedContext,
  SelectedPassengersByJourney,
} from '@dcx/ui/libs';
import { BOOKING_FAKE } from '@dcx/ui/mock-repository';
import { BehaviorSubject, Observable } from 'rxjs';

function isApiBookingLike(b: any): boolean {
  return !!b?.pricing && !!b.pricing?.breakdown;
}

class StorageServiceStoryFake {
  private store = new Map<string, unknown>();
  private set(ns: 'local' | 'session', k: string, v: unknown): void { this.store.set(`${ns}:${k}`, v); }
  private get(ns: 'local' | 'session', k: string): unknown { return this.store.get(`${ns}:${k}`) ?? null; }

  setLocalStorage(key: string, value: unknown, _timeout = 0): void { this.set('local', key, value); }
  getLocalStorage(key: string): unknown { return this.get('local', key); }
  removeLocalStorage(key: string): void { this.store.delete(`local:${key}`); }
  removeAllLocalStorage(): void {}
  cleanLocalStorage(): void {}

  setSessionStorage(key: string, value: unknown, _timeout = 0): void { this.set('session', key, value); }
  getSessionStorage(key: string): unknown { return this.get('session', key); }
  removeSessionStorage(key: string): void { this.store.delete(`session:${key}`); }
  removeAllSessionStorage(): void {
    for (const k of [...this.store.keys()]) if (k.startsWith('session:')) this.store.delete(k);
  }
  cleanSessionStorage(): void { this.removeAllSessionStorage(); }
}

export interface StorySessionSeed {
  booking?: unknown;
  selectedPassengersByJourney?: SelectedPassengersByJourney;
  seatAssignedContext?: SeatAssignedContext;
}

/** Triggers post-DI seeding on SessionStore. */
const SEED_STORYBOOK_SESSION = new InjectionToken<void>('SEED_STORYBOOK_SESSION');

/** Minimal SharedSessionService stub that emits a ready SessionData. */
class SharedSessionServiceStub {
  public readonly sessionSubject: BehaviorSubject<SessionData>;
  public readonly session$: Observable<SessionData>;
  public session: SessionData;

  constructor(initial: SessionData) {
    this.session = initial;
    this.sessionSubject = new BehaviorSubject<SessionData>(structuredClone(initial));
    this.session$ = this.sessionSubject.asObservable();
  }

  public updateBooking(): void {
    this.sessionSubject.next(structuredClone(this.session));
  }

  public addSeatService(_service: unknown): void {
    // No-op in Storybook; real side effects handled in production service.
  }

  public removeService(_service: unknown): void {
    // No-op in Storybook; real side effects handled in production service.
  }

  public calculateAmountSummaryForPerPaxSegment(): number {
    const perPaxSegment = this.session?.session?.booking?.pricing?.breakdown?.perPaxSegment ?? [];
    return perPaxSegment.reduce((sum, entry) => sum + (entry?.totalAmount ?? 0), 0);
  }
}

export function buildStorybookSessionProviders(seed: StorySessionSeed = {}): Provider[] {
  // Build initial session strictly from CLEAN_SESSION_DATA
  const initial: SessionData = {
    ...CLEAN_SESSION_DATA,
    session: {
      ...CLEAN_SESSION_DATA.session,
      booking: (seed.booking ?? BOOKING_FAKE) as any,
    },
  };

  return [
    {
      provide: StorageService,
      deps: [BUSINESS_CONFIG],
      useFactory: (cfg: BusinessConfig): StorageService => {
        const storage = new StorageServiceStoryFake();

        // Persist full SessionData under the exact key used by the real SessionStore
        const key = cfg?.sessionKey || 'Session';
        storage.setSessionStorage(key, initial);

        // Mirror commonly used keys for components that read by EnumStorageKey
        storage.setSessionStorage(EnumStorageKey.SessionBooking as any, initial.session.booking);
        if (seed.selectedPassengersByJourney) {
          storage.setSessionStorage(
            EnumStorageKey.SelectedPassengersByJourney as any,
            seed.selectedPassengersByJourney
          );
        }

        if (seed.seatAssignedContext) {
          storage.setSessionStorage(EnumStorageKey.SeatAssignedContext as any, seed.seatAssignedContext);
        }

        return storage as unknown as StorageService;
      },
    },
    {
      provide: SEED_STORYBOOK_SESSION,
      deps: [SessionStore],
      useFactory: (s: SessionStore) => {
        // 1) Seed the whole session object first
        (s as any).setSession(initial);

        // 2) Choose which booking to persist in SessionStore
        //    - Prefer seed.booking if it looks like ApiBooking (has pricing.breakdown)
        //    - Otherwise keep the initial booking (ideally BOOKING_FAKE.booking)
        const candidate = (seed as any)?.booking;
        if (candidate) {
          if (isApiBookingLike(candidate)) {
            (s as any).set(EnumStorageKey.SessionBooking as any, candidate);
          } else {
            console.warn(
              '[storybook-session] Provided booking is not ApiBooking-like; keeping default initial.session.booking to avoid SummaryCart errors.'
            );
            (s as any).set(
              EnumStorageKey.SessionBooking as any,
              initial.session.booking
            );
          }
        } else {
          // No override provided → keep initial booking
          (s as any).set(
            EnumStorageKey.SessionBooking as any,
            initial.session.booking
          );
        }

        // 3) Other session keys (safe to apply regardless of booking shape)
        if (seed.selectedPassengersByJourney) {
          (s as any).set(
            EnumStorageKey.SelectedPassengersByJourney as any,
            seed.selectedPassengersByJourney
          );
        }

        if (seed.seatAssignedContext) {
          (s as any).set(EnumStorageKey.SeatAssignedContext as any, seed.seatAssignedContext);
        }

        return true;
      },
    },
    {
      provide: SharedSessionService,
      useFactory: () => new SharedSessionServiceStub(initial),
    },
  ];
}
