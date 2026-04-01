import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NEVER, Observable, of, race, Subject, switchMap, take, tap, timer } from 'rxjs';

import { EnumStorageKey, StorageService } from '../../shared';
import { IbeEventRedirectType } from '../models/ibe-event-redirect-type';
import type { TabGuardMessage, TabGuardMessageType } from '../models/tab-guard/tab-guard.model';
import { TAB_GUARD_CONSTANTS, TAB_GUARD_MESSAGE_TYPE } from '../models/tab-guard/tab-guard.model';

import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';
import { RedirectionService } from './redirection.service';
import { SessionIdService } from './session-id.service';

/**
 * Guards against duplicate tabs and URL copy-paste on protected routes.
 *
 * Route classification is driven by CMS config:
 * `excludedRedirectMultipleTabsUrls` — routes listed there (e.g. login)
 * are exempt from the guard and can be freely duplicated.
 *
 * For non-excluded routes, the guard uses BroadcastChannel to detect
 * whether another tab already holds an active session:
 *
 * 1. **Tab duplication:** sessionStorage is cloned, so two tabs
 *    share the same tabSessionId. The newcomer announces via BroadcastChannel,
 *    the original responds, and the newcomer self-blocks.
 *
 * 2. **URL copy-paste:** sessionStorage is empty in the new tab. The newcomer
 *    sends a Probe. If any active tab responds, the newcomer blocks itself.
 *
 * If no response arrives within the timeout, the tab is considered legitimate.
 */
@Injectable({ providedIn: 'root' })
export class TabGuardService {
  private readonly _storageService = inject(StorageService);
  private readonly _sessionIdService = inject(SessionIdService);
  private readonly _logger = inject(LoggerService);
  private readonly _redirectService = inject(RedirectionService);
  private readonly _configService = inject(ConfigService);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _volatileTabId = crypto.randomUUID();
  private _broadcastChannel: BroadcastChannel | null = null;
  private readonly _initComplete$ = new Subject<void>();
  private _guardResolved = false;

  public readonly isDuplicate = signal(false);

  private readonly _sessionActiveKeys: readonly EnumStorageKey[] = [
    EnumStorageKey.SessionRef,
    EnumStorageKey.SessionBooking,
  ];

  private readonly _protectedSessionKeys: readonly EnumStorageKey[] = [
    EnumStorageKey.SessionRef,
    EnumStorageKey.SessionBooking,
    EnumStorageKey.SeatMapBooking,
    EnumStorageKey.SeatAssignedContext,
    EnumStorageKey.SegmentsStatusByJourney,
    EnumStorageKey.PaxSegmentCheckInStatus,
    EnumStorageKey.WciPaymentWithServices,
    EnumStorageKey.BalanceDueAmount,
    EnumStorageKey.PsePaymentStorage,
    EnumStorageKey.PaxIdSavePerJourney,
    EnumStorageKey.PendingSeatServices,
    EnumStorageKey.HadPayment,
    EnumStorageKey.WciPendingPaymentAmount,
    EnumStorageKey.WciEmailPending,
    EnumStorageKey.TabGuardArmed,
  ];

  private readonly _probeMessageTypes: readonly TabGuardMessageType[] = [
    TAB_GUARD_MESSAGE_TYPE.Announce,
    TAB_GUARD_MESSAGE_TYPE.Probe,
  ];

  private readonly _messageFieldValidators: readonly [string, string][] = [
    ['type', 'string'],
    ['volatileTabId', 'string'],
    ['tabSessionId', 'string'],
    ['pathname', 'string'],
    ['timestamp', 'number'],
  ];

  public init(): Observable<void> {
    if (this.wasRedirectedByGuard()) {
      this._storageService.removeSessionStorage(EnumStorageKey.TabGuardRedirected);
      return of(undefined);
    }

    if (this.isRouteExcludedFromRedirect()) {
      return of(undefined);
    }

    this.setupBroadcastChannel();

    if (this.hasActiveSession()) {
      this.postMessage(TAB_GUARD_MESSAGE_TYPE.Announce);
      return this.waitForGuardResolution();
    }

    this.postMessage(TAB_GUARD_MESSAGE_TYPE.Probe);
    this.scheduleGuardResolution();
    return of(undefined);
  }

  private hasActiveSession(): boolean {
    return this._sessionActiveKeys.some((key) => !!this._storageService.getSessionStorage(key));
  }

  private wasRedirectedByGuard(): boolean {
    return !!this._storageService.getSessionStorage(EnumStorageKey.TabGuardRedirected);
  }

  private isRouteExcludedFromRedirect(): boolean {
    const excludedSegments = this._configService.getBusinessConfig()?.excludedRedirectMultipleTabsUrls;

    if (!excludedSegments?.length) {
      return false;
    }

    const currentPath = globalThis.location.pathname.toLowerCase();
    return excludedSegments.some((segment: string) => currentPath.includes(segment.toLowerCase()));
  }

  private setupBroadcastChannel(): void {
    this._broadcastChannel = new BroadcastChannel(TAB_GUARD_CONSTANTS.CHANNEL_NAME);
    this._broadcastChannel.onmessage = (event: MessageEvent<unknown>) => {
      if (this.isValidMessage(event.data)) {
        this.handleIncomingMessage(event.data);
      }
    };

    this._destroyRef.onDestroy(() => {
      this._broadcastChannel?.close();
      this._broadcastChannel = null;
    });
  }

  private handleIncomingMessage(message: TabGuardMessage): void {
    if (message.volatileTabId === this._volatileTabId) {
      return;
    }

    if (this._probeMessageTypes.includes(message.type)) {
      if (this.hasActiveSession()) {
        this.postMessage(TAB_GUARD_MESSAGE_TYPE.Respond);
      }
      return;
    }

    if (message.type === TAB_GUARD_MESSAGE_TYPE.Respond) {
      this.handleRespondMessage(message);
    }
  }

  private handleRespondMessage(message: TabGuardMessage): void {
    if (this._guardResolved) {
      return;
    }

    const isDuplicateTab = this.hasActiveSession() && message.tabSessionId === this.getTabSessionId();
    const isUnauthorizedTab = !this.hasActiveSession();

    if (isDuplicateTab) {
      this._logger.warn('TabGuardService', 'Duplicate tab detected — clearing session and redirecting');
      this._guardResolved = true;
      this.isDuplicate.set(true);
      this._sessionIdService.regenerateSessionId();
      this.clearProtectedSessionData();
      this.blockAndRedirect();
      this._initComplete$.next();
      return;
    }

    if (isUnauthorizedTab) {
      this._logger.warn('TabGuardService', 'Unauthorized tab detected (URL paste) — redirecting');
      this._guardResolved = true;
      this.isDuplicate.set(true);
      this.blockAndRedirect();
      this._initComplete$.next();
    }
  }

  private clearProtectedSessionData(): void {
    this._protectedSessionKeys.forEach((key) => this._storageService.removeSessionStorage(key));
  }

  private blockAndRedirect(): void {
    this._storageService.setSessionStorage(EnumStorageKey.TabGuardRedirected, true);
    const homeUrl = this._configService.getBusinessConfig()?.urlHome || '/';
    this._logger.warn('TabGuardService', 'Redirect details: ', { redirectUrl: homeUrl });
    this._redirectService.redirect(IbeEventRedirectType.internalRedirect, homeUrl);
  }

  private postMessage(type: TabGuardMessageType): void {
    const message: TabGuardMessage = {
      type,
      volatileTabId: this._volatileTabId,
      tabSessionId: this.getTabSessionId(),
      pathname: globalThis.location.pathname,
      timestamp: Date.now(),
    };
    this._broadcastChannel?.postMessage(message);
  }

  private getTabSessionId(): string {
    return this._storageService.getSessionStorage(EnumStorageKey.TabSessionId)?.tabSessionId || '';
  }

  private scheduleGuardResolution(): void {
    timer(TAB_GUARD_CONSTANTS.PROBE_TIMEOUT_MS)
      .pipe(take(1))
      .subscribe(() => {
        this._guardResolved = true;
      });
  }

  private waitForGuardResolution(): Observable<void> {
    return race(this._initComplete$.pipe(take(1)), timer(TAB_GUARD_CONSTANTS.PROBE_TIMEOUT_MS)).pipe(
      take(1),
      tap(() => {
        this._guardResolved = true;
      }),
      switchMap(() => (this.isDuplicate() ? NEVER : of(undefined)))
    );
  }

  private isValidMessage(data: unknown): data is TabGuardMessage {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const candidate = data as Record<string, unknown>;

    const hasValidShape = this._messageFieldValidators.every(
      ([field, expectedType]) => typeof candidate[field] === expectedType
    );

    return hasValidShape && Object.values(TAB_GUARD_MESSAGE_TYPE).includes(candidate['type'] as TabGuardMessageType);
  }
}
