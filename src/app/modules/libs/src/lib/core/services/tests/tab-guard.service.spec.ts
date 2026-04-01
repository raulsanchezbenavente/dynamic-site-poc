import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StorageService } from '@dcx/ui/libs';
import { EnumStorageKey } from '../../../shared/enums/enum-storage-keys';
import { IbeEventRedirectType } from '../../models/ibe-event-redirect-type';
import { TAB_GUARD_CONSTANTS, TAB_GUARD_MESSAGE_TYPE } from '../../models/tab-guard/tab-guard.model';
import type { TabGuardMessage } from '../../models/tab-guard/tab-guard.model';
import { ConfigService } from '../config.service';
import { LoggerService } from '../logger.service';
import { RedirectionService } from '../redirection.service';
import { SessionIdService } from '../session-id.service';
import { TabGuardService } from '../tab-guard.service';

function createTabGuardMessage(overrides?: Partial<TabGuardMessage>): TabGuardMessage {
  return {
    type: TAB_GUARD_MESSAGE_TYPE.Respond,
    volatileTabId: 'remote-tab-id',
    tabSessionId: 'shared-session-123',
    pathname: '/some-page',
    timestamp: Date.now(),
    ...overrides,
  };
}

function fakeSessionStorage(map: Partial<Record<EnumStorageKey, unknown>>): (key: string) => unknown {
  return (key: string) => map[key as EnumStorageKey] ?? undefined;
}

const ACTIVE_SESSION_MAP: Partial<Record<EnumStorageKey, unknown>> = {
  [EnumStorageKey.SessionRef]: 'ref-123',
  [EnumStorageKey.TabSessionId]: { tabSessionId: 'shared-session-123' },
};

const REDIRECTED_SESSION_MAP: Partial<Record<EnumStorageKey, unknown>> = {
  [EnumStorageKey.TabGuardRedirected]: true,
};

const DEFAULT_HOME_URL = '/en/check-in/login/';
const EXPECTED_PROTECTED_KEYS: readonly EnumStorageKey[] = [
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

const NON_EXCLUDED_CONFIG = {
  urlHome: DEFAULT_HOME_URL,
  excludedRedirectMultipleTabsUrls: ['/login'],
};

describe('TabGuardService', () => {
  let service: TabGuardService;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let sessionIdServiceMock: jasmine.SpyObj<SessionIdService>;
  let loggerMock: jasmine.SpyObj<LoggerService>;
  let redirectServiceMock: jasmine.SpyObj<RedirectionService>;
  let configServiceMock: jasmine.SpyObj<ConfigService>;
  let destroyRefMock: jasmine.SpyObj<DestroyRef>;
  let broadcastChannelMock: {
    postMessage: jasmine.Spy;
    close: jasmine.Spy;
    onmessage: ((event: MessageEvent) => void) | null;
  };
  let originalBroadcastChannel: typeof BroadcastChannel;

  beforeEach(() => {
    broadcastChannelMock = {
      postMessage: jasmine.createSpy('postMessage'),
      close: jasmine.createSpy('close'),
      onmessage: null,
    };

    originalBroadcastChannel = (globalThis as any).BroadcastChannel;
    (globalThis as any).BroadcastChannel = jasmine
      .createSpy('BroadcastChannel')
      .and.returnValue(broadcastChannelMock);

    storageServiceMock = jasmine.createSpyObj<StorageService>('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
      'removeSessionStorage',
    ]);
    sessionIdServiceMock = jasmine.createSpyObj<SessionIdService>('SessionIdService', [
      'regenerateSessionId',
    ]);
    loggerMock = jasmine.createSpyObj<LoggerService>('LoggerService', ['warn', 'error', 'info']);
    redirectServiceMock = jasmine.createSpyObj<RedirectionService>('RedirectionService', ['redirect']);
    configServiceMock = jasmine.createSpyObj<ConfigService>('ConfigService', ['getBusinessConfig']);
    destroyRefMock = jasmine.createSpyObj<DestroyRef>('DestroyRef', ['onDestroy']);

    storageServiceMock.getSessionStorage.and.returnValue(undefined);
    configServiceMock.getBusinessConfig.and.returnValue(NON_EXCLUDED_CONFIG as any);

    TestBed.configureTestingModule({
      providers: [
        TabGuardService,
        { provide: StorageService, useValue: storageServiceMock },
        { provide: SessionIdService, useValue: sessionIdServiceMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: RedirectionService, useValue: redirectServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: DestroyRef, useValue: destroyRefMock },
      ],
    });

    service = TestBed.inject(TabGuardService);
  });

  afterEach(() => {
    (globalThis as any).BroadcastChannel = originalBroadcastChannel;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init — redirected guard flag', () => {
    it('should clear redirect flag and skip all logic', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(REDIRECTED_SESSION_MAP));

      service.init().subscribe();

      expect(storageServiceMock.removeSessionStorage).toHaveBeenCalledWith(EnumStorageKey.TabGuardRedirected);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
      expect(broadcastChannelMock.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('init — excluded routes', () => {
    it('should not redirect when current route is excluded', () => {
      configServiceMock.getBusinessConfig.and.returnValue({
        urlHome: DEFAULT_HOME_URL,
        excludedRedirectMultipleTabsUrls: [globalThis.location.pathname],
      } as any);

      service.init().subscribe();

      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
      expect(broadcastChannelMock.postMessage).not.toHaveBeenCalled();
    });

    it('should be case-insensitive when matching excluded routes', () => {
      configServiceMock.getBusinessConfig.and.returnValue({
        urlHome: DEFAULT_HOME_URL,
        excludedRedirectMultipleTabsUrls: [globalThis.location.pathname.toUpperCase()],
      } as any);

      service.init().subscribe();

      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });
  });

  describe('init — non-excluded route with active session (Ctrl+D)', () => {
    it('should setup BroadcastChannel and send Announce', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));

      service.init();

      expect(globalThis.BroadcastChannel).toHaveBeenCalledWith(TAB_GUARD_CONSTANTS.CHANNEL_NAME);
      expect(broadcastChannelMock.postMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: TAB_GUARD_MESSAGE_TYPE.Announce }),
      );
    });
  });

  describe('init — non-excluded route without session (copy-paste)', () => {
    it('should send a Probe message and complete immediately', () => {
      let completed = false;
      service.init().subscribe({ complete: () => (completed = true) });

      expect(globalThis.BroadcastChannel).toHaveBeenCalledWith(TAB_GUARD_CONSTANTS.CHANNEL_NAME);
      expect(broadcastChannelMock.postMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: TAB_GUARD_MESSAGE_TYPE.Probe }),
      );
      expect(completed).toBe(true);
    });
  });

  describe('handleIncomingMessage — Announce/Probe', () => {
    it('should respond to announce when this tab has active session', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      service.init();
      broadcastChannelMock.postMessage.calls.reset();

      const announceMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Announce,
      });

      broadcastChannelMock.onmessage!({ data: announceMessage } as MessageEvent);

      expect(broadcastChannelMock.postMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: TAB_GUARD_MESSAGE_TYPE.Respond }),
      );
    });

    it('should ignore messages from the same volatile tab id', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      service.init();
      broadcastChannelMock.postMessage.calls.reset();

      const selfMessage = createTabGuardMessage({
        volatileTabId: service['_volatileTabId'],
      });

      broadcastChannelMock.onmessage!({ data: selfMessage } as MessageEvent);

      expect(broadcastChannelMock.postMessage).not.toHaveBeenCalled();
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });
  });

  describe('handleRespondMessage — duplicate tab', () => {
    beforeEach(() => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      service.init();
      broadcastChannelMock.postMessage.calls.reset();
    });

    it('should detect duplicate and redirect', () => {
      const respondMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
      });

      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      expect(service.isDuplicate()).toBe(true);
      expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        DEFAULT_HOME_URL,
      );
      expect(sessionIdServiceMock.regenerateSessionId).toHaveBeenCalled();
    });

    it('should clear protected session data on duplicate', () => {
      const respondMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
      });

      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      const removedKeys = storageServiceMock.removeSessionStorage.calls
        .allArgs()
        .map((args) => args[0]);

      EXPECTED_PROTECTED_KEYS.forEach((key) => {
        expect(removedKeys).toContain(key);
      });
    });

    it('should not detect duplicate with different tabSessionId', () => {
      const respondMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'other-session-456',
      });

      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      expect(service.isDuplicate()).toBe(false);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });
  });

  describe('handleRespondMessage — unauthorized tab (copy-paste)', () => {
    beforeEach(() => {
      storageServiceMock.getSessionStorage.and.returnValue(undefined);
      service.init();
      broadcastChannelMock.postMessage.calls.reset();
    });

    it('should redirect unauthorized tab', () => {
      const respondMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
      });

      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      expect(service.isDuplicate()).toBe(true);
      expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        DEFAULT_HOME_URL,
      );
    });
  });

  describe('message validation', () => {
    beforeEach(() => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      service.init();
    });

    it('should reject null messages', () => {
      broadcastChannelMock.onmessage!({ data: null } as MessageEvent);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });

    it('should reject non-object messages', () => {
      broadcastChannelMock.onmessage!({ data: 'invalid-string' } as MessageEvent);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });

    it('should reject messages with invalid type value', () => {
      const invalidMessage = {
        type: 'unknown-type',
        volatileTabId: 'some-id',
        tabSessionId: 'some-session',
        pathname: '/',
        timestamp: Date.now(),
      };

      broadcastChannelMock.onmessage!({ data: invalidMessage } as MessageEvent);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });
  });

  describe('blockAndRedirect', () => {
    it('should fallback to / when urlHome is missing', () => {
      configServiceMock.getBusinessConfig.and.returnValue({
        excludedRedirectMultipleTabsUrls: ['/login'],
      } as any);
      storageServiceMock.getSessionStorage.and.returnValue(undefined);
      service.init();

      const respondMessage = createTabGuardMessage({ type: TAB_GUARD_MESSAGE_TYPE.Respond });
      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        '/',
      );
    });
  });

  describe('guard resolution — prevents original tab from reacting to cross-RESPOND (mass duplication race condition)', () => {
    it('should ignore RESPOND messages after guard resolves via timeout (original tab scenario)', (done) => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));

      service.init().subscribe(() => {
        broadcastChannelMock.postMessage.calls.reset();

        const crossRespond = createTabGuardMessage({
          type: TAB_GUARD_MESSAGE_TYPE.Respond,
          tabSessionId: 'shared-session-123',
        });

        broadcastChannelMock.onmessage!({ data: crossRespond } as MessageEvent);

        expect(service.isDuplicate()).toBe(false);
        expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
        done();
      });

      jasmine.clock().install();
      jasmine.clock().tick(TAB_GUARD_CONSTANTS.PROBE_TIMEOUT_MS + 100);
      jasmine.clock().uninstall();
    });

    it('should ignore RESPOND messages after duplicate detection resolves the guard', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      service.init().subscribe();
      
      const firstRespond = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
      });
      broadcastChannelMock.onmessage!({ data: firstRespond } as MessageEvent);
      expect(service.isDuplicate()).toBe(true);

      redirectServiceMock.redirect.calls.reset();
      storageServiceMock.removeSessionStorage.calls.reset();
      
      const secondRespond = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
        volatileTabId: 'another-remote-tab',
      });
      broadcastChannelMock.onmessage!({ data: secondRespond } as MessageEvent);
      
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
      expect(storageServiceMock.removeSessionStorage).not.toHaveBeenCalled();
    });

    it('should still respond to ANNOUNCE messages after guard resolves (legitimate tab continues defending)', (done) => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));

      service.init().subscribe(() => {
        broadcastChannelMock.postMessage.calls.reset();
        
        const announce = createTabGuardMessage({
          type: TAB_GUARD_MESSAGE_TYPE.Announce,
          volatileTabId: 'new-duplicate-tab',
        });

        broadcastChannelMock.onmessage!({ data: announce } as MessageEvent);

        expect(broadcastChannelMock.postMessage).toHaveBeenCalledWith(
          jasmine.objectContaining({ type: TAB_GUARD_MESSAGE_TYPE.Respond }),
        );
        done();
      });

      jasmine.clock().install();
      jasmine.clock().tick(TAB_GUARD_CONSTANTS.PROBE_TIMEOUT_MS + 100);
      jasmine.clock().uninstall();
    });

    it('should block app initialization (NEVER) when duplicate is detected — prevents competing component redirects', () => {
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));

      let emitted = false;
      let completed = false;
      service.init().subscribe({
        next: () => (emitted = true),
        complete: () => (completed = true),
      });

      const respondMessage = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
      });
      broadcastChannelMock.onmessage!({ data: respondMessage } as MessageEvent);

      expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        DEFAULT_HOME_URL,
      );

      expect(emitted).toBe(false);
      expect(completed).toBe(false);
    });

    it('should ignore RESPOND after probe guard window closes (copy-paste tab that later acquires session)', () => {
      jasmine.clock().install();

      storageServiceMock.getSessionStorage.and.returnValue(undefined);
      service.init().subscribe();
      
      jasmine.clock().tick(TAB_GUARD_CONSTANTS.PROBE_TIMEOUT_MS + 100);
      jasmine.clock().uninstall();
      
      storageServiceMock.getSessionStorage.and.callFake(fakeSessionStorage(ACTIVE_SESSION_MAP));
      
      const crossRespond = createTabGuardMessage({
        type: TAB_GUARD_MESSAGE_TYPE.Respond,
        tabSessionId: 'shared-session-123',
      });

      broadcastChannelMock.onmessage!({ data: crossRespond } as MessageEvent);

      expect(service.isDuplicate()).toBe(false);
      expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
    });
  });
});
