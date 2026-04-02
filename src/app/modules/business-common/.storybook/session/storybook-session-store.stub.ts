import { BehaviorSubject, of } from 'rxjs';
import type { SessionData } from '@dcx/ui/libs';
import { CLEAN_SESSION_DATA, EnumStorageKey } from '@dcx/ui/libs';

export class StorybookSessionStoreStub {
  private store = new Map<string, unknown>();

  private _session: SessionData = { ...CLEAN_SESSION_DATA };

  private sessionDataSubject = new BehaviorSubject<SessionData>(this._session);
  public readonly sessionData$ = this.sessionDataSubject.asObservable();

  get<T = unknown>(key: string): T | null { return (this.store.get(key) as T) ?? null; }
  set<T = unknown>(key: string, value: T): void { this.store.set(key, value); }
  select$<T = unknown>(key: string) { return of(this.get<T>(key)); }

  getSession<T = unknown>(): T { return this._session as unknown as T; }

  setSession<T = unknown>(value: T): void {
    this._session = value as unknown as SessionData;
    this.sessionDataSubject.next(this._session);
  }

  getApiSession() { return of(this.getSession()); }
  loadInitSession() { return of(true); }
  resetApiSession() { return of(this.getSession()); }

  reloadBooking(booking?: unknown) {
    if (booking) {
      this._session = { ...this._session, session: { ...this._session.session, booking } } as SessionData;
      this.sessionDataSubject.next(this._session);
      this.set(EnumStorageKey.SessionBooking as any, booking);
    }
    return of(true);
  }

  remove(key: string): void { this.store.delete(key); }
  clear(): void {
    this.store.clear();
    this._session = { ...CLEAN_SESSION_DATA };
    this.sessionDataSubject.next(this._session);
  }
}
