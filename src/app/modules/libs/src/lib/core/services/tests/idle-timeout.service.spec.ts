import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IdleTimeoutService } from '../idle-timeout.service';
import { TIME_ALERT_EXPIRED_SESSION, TIME_EXPIRED_SESSION } from '../../injection-tokens/injectiontokens';
import { EXCLUDE_SESSION_EXPIRED_URLS, NotificationService, TIMEOUT_REDIRECT } from '../../../shared';
import { RedirectionService } from '../redirection.service';
import { IbeEventRedirectType } from '../../models';

describe('IdleTimeoutService', () => {
  let service: IdleTimeoutService;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let redirectionServiceSpy: jasmine.SpyObj<RedirectionService>;
  
  const alertTime = 1000;
  const expiredTime = 2000;
  const excludedUrls = ['/excluded'];
  const timeoutRedirect = '/timeout';

  beforeEach(() => {
    const notifSpy = jasmine.createSpyObj('NotificationService', ['openModalTimeOut']);
    const redirectSpy = jasmine.createSpyObj('RedirectionService', ['redirect']);

    TestBed.configureTestingModule({
      providers: [
        IdleTimeoutService,
        { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
        { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
        { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
        { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
        { provide: NotificationService, useValue: notifSpy },
        { provide: RedirectionService, useValue: redirectSpy }
      ],
    });
    service = TestBed.inject(IdleTimeoutService);
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    redirectionServiceSpy = TestBed.inject(RedirectionService) as jasmine.SpyObj<RedirectionService>;
  });

  afterEach(() => {
    // Clean up corporate elements
    const corporateElements = document.querySelectorAll('[corporate]');
    corporateElements.forEach(el => el.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize timeoutExpiredShow Subject', () => {
    expect(service.timeoutExpiredShow).toBeDefined();
    expect(service.timeoutExpiredShow).toBeInstanceOf(Object);
  });

  it('should initialize timeoutTotalExpired Subject', () => {
    expect(service.timeoutTotalExpired).toBeDefined();
    expect(service.timeoutTotalExpired).toBeInstanceOf(Object);
  });

  describe('Timer Logic', () => {
    it('should start timers on init', fakeAsync(() => {
      service.stopTimer();
      spyOn(service as any, 'timeoutExpiredShowHandler');
      spyOn(service as any, 'timeoutTotalExpiredHandler');
      
      (service as any).startTimer();
      
      tick(alertTime);
      expect((service as any).timeoutExpiredShowHandler).toHaveBeenCalled();
      
      tick(expiredTime - alertTime);
      expect((service as any).timeoutTotalExpiredHandler).toHaveBeenCalled();
      
      service.stopTimer();
    }));

    it('should start timers automatically on service creation', fakeAsync(() => {
      // Service already created in beforeEach, timers already running
      // Just verify timers trigger after waiting
      spyOn(service as any, 'timeoutExpiredShowHandler').and.callThrough();
      Object.defineProperty(service, 'globalUrl', { value: '/page/', configurable: true });
      
      service.resetTimer();
      tick(alertTime);
      expect((service as any).timeoutExpiredShowHandler).toHaveBeenCalled();
      
      service.stopTimer();
    }));

    it('should unsubscribe existing timers when startTimer is called again', fakeAsync(() => {
      (service as any).startTimer();
      const subShow = (service as any).timerSubscriptionShow;
      const subExpired = (service as any).timerSubscriptionExpired;
      spyOn(subShow, 'unsubscribe').and.callThrough();
      spyOn(subExpired, 'unsubscribe').and.callThrough();

      (service as any).startTimer();
      
      expect(subShow.unsubscribe).toHaveBeenCalled();
      expect(subExpired.unsubscribe).toHaveBeenCalled();
      service.stopTimer();
    }));

    it('should reset timers', fakeAsync(() => {
      spyOn(service as any, 'timeoutExpiredShowHandler');
      
      (service as any).startTimer();
      tick(alertTime / 2);
      
      service.resetTimer();
      tick(alertTime / 2);
      expect((service as any).timeoutExpiredShowHandler).not.toHaveBeenCalled();
      
      tick(alertTime / 2);
      expect((service as any).timeoutExpiredShowHandler).toHaveBeenCalled();
      
      service.stopTimer();
    }));

    it('should handle resetTimer when no subscriptions exist', () => {
       // Ensure no subscriptions
       service.stopTimer();
       // Should not throw
       expect(() => service.resetTimer()).not.toThrow();
       expect(service).toBeTruthy();
       service.stopTimer();
    });

    it('should unsubscribe show timer when resetTimer is called', fakeAsync(() => {
      const subShow = (service as any).timerSubscriptionShow;
      spyOn(subShow, 'unsubscribe').and.callThrough();

      service.resetTimer();
      
      expect(subShow.unsubscribe).toHaveBeenCalled();
      service.stopTimer();
    }));

    it('should unsubscribe expired timer when resetTimer is called', fakeAsync(() => {
      const subExpired = (service as any).timerSubscriptionExpired;
      spyOn(subExpired, 'unsubscribe').and.callThrough();

      service.resetTimer();
      
      expect(subExpired.unsubscribe).toHaveBeenCalled();
      service.stopTimer();
    }));

    it('should create new timers with correct durations after reset', fakeAsync(() => {
      service.resetTimer();
      spyOn(service as any, 'timeoutExpiredShowHandler');
      
      tick(alertTime);
      expect((service as any).timeoutExpiredShowHandler).toHaveBeenCalled();
      
      service.stopTimer();
    }));

    it('should handle stopTimer gracefully', () => {
      expect(() => service.stopTimer()).not.toThrow();
    });

    it('should unsubscribe both timers when stopTimer is called', fakeAsync(() => {
      const subShow = (service as any).timerSubscriptionShow;
      const subExpired = (service as any).timerSubscriptionExpired;
      spyOn(subShow, 'unsubscribe').and.callThrough();
      spyOn(subExpired, 'unsubscribe').and.callThrough();

      service.stopTimer();
      
      expect(subShow.unsubscribe).toHaveBeenCalled();
      expect(subExpired.unsubscribe).toHaveBeenCalled();
    }));
  });

  describe('Handlers', () => {
    beforeEach(() => {
      const existing = document.querySelectorAll('[corporate]');
      existing.forEach(e => e.remove());
      notificationServiceSpy.openModalTimeOut.calls.reset();
      redirectionServiceSpy.redirect.calls.reset();
    });

    afterEach(() => {
      const existing = document.querySelectorAll('[corporate]');
      existing.forEach(e => e.remove());
    });

    describe('timeoutExpiredShowHandler', () => {
      it('should open modal on timeoutExpiredShowHandler if not corporate and not root', () => {
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });
        
        (service as any).timeoutExpiredShowHandler();
        
        expect(notificationServiceSpy.openModalTimeOut).toHaveBeenCalled();
        
        // Test the callback passed to openModalTimeOut
        const callback = notificationServiceSpy.openModalTimeOut.calls.mostRecent().args[0];
        spyOn(service, 'resetTimer');
        callback();
        expect(service.resetTimer).toHaveBeenCalled();
      });

      it('should NOT open modal on timeoutExpiredShowHandler if corporate', () => {
        // Mock corporate
        const div = document.createElement('div');
        div.setAttribute('corporate', '');
        document.body.appendChild(div);
        
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            IdleTimeoutService,
            { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
            { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
            { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
            { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
            { provide: NotificationService, useValue: notificationServiceSpy },
            { provide: RedirectionService, useValue: redirectionServiceSpy }
          ],
        });
        service = TestBed.inject(IdleTimeoutService);
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });

        (service as any).timeoutExpiredShowHandler();
        
        expect(notificationServiceSpy.openModalTimeOut).not.toHaveBeenCalled();
      });

      it('should NOT open modal on timeoutExpiredShowHandler if root', () => {
        Object.defineProperty(service, 'globalUrl', { value: '/', configurable: true });
        
        (service as any).timeoutExpiredShowHandler();
        
        expect(notificationServiceSpy.openModalTimeOut).not.toHaveBeenCalled();
      });

      it('should handle callback from openModalTimeOut correctly', () => {
        Object.defineProperty(service, 'globalUrl', { value: '/page/', configurable: true });
        spyOn(service, 'resetTimer');
        
        (service as any).timeoutExpiredShowHandler();
        
        const callback = notificationServiceSpy.openModalTimeOut.calls.mostRecent().args[0];
        callback();
        
        expect(service.resetTimer).toHaveBeenCalled();
      });
    });

    describe('timeoutTotalExpiredHandler', () => {
      it('should redirect on timeoutTotalExpiredHandler if not corporate and not root', () => {
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });
        
        (service as any).timeoutTotalExpiredHandler();
        
        expect(redirectionServiceSpy.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, timeoutRedirect);
      });
      
      it('should NOT redirect on timeoutTotalExpiredHandler if root', () => {
        Object.defineProperty(service, 'globalUrl', { value: '/', configurable: true });
        
        (service as any).timeoutTotalExpiredHandler();
        
        expect(redirectionServiceSpy.redirect).not.toHaveBeenCalled();
      });

      it('should NOT redirect on timeoutTotalExpiredHandler if corporate', () => {
        // Mock corporate
        const div = document.createElement('div');
        div.setAttribute('corporate', '');
        document.body.appendChild(div);
        
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            IdleTimeoutService,
            { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
            { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
            { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
            { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
            { provide: NotificationService, useValue: notificationServiceSpy },
            { provide: RedirectionService, useValue: redirectionServiceSpy }
          ],
        });
        service = TestBed.inject(IdleTimeoutService);
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });

        (service as any).timeoutTotalExpiredHandler();
        
        expect(redirectionServiceSpy.redirect).not.toHaveBeenCalled();
      });

      it('should use default redirect path if TIMEOUT_REDIRECT is null', () => {
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
              providers: [
                  IdleTimeoutService,
                  { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
                  { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
                  { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
                  { provide: TIMEOUT_REDIRECT, useValue: null }, // Null redirect
                  { provide: NotificationService, useValue: notificationServiceSpy },
                  { provide: RedirectionService, useValue: redirectionServiceSpy }
              ],
          });
          service = TestBed.inject(IdleTimeoutService);
          Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });

          (service as any).timeoutTotalExpiredHandler();

          expect(redirectionServiceSpy.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '/');
      });

      it('should use default redirect path if TIMEOUT_REDIRECT is undefined', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                IdleTimeoutService,
                { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
                { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
                { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
                { provide: TIMEOUT_REDIRECT, useValue: undefined },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: RedirectionService, useValue: redirectionServiceSpy }
            ],
        });
        service = TestBed.inject(IdleTimeoutService);
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });

        (service as any).timeoutTotalExpiredHandler();

        expect(redirectionServiceSpy.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '/');
      });

      it('should use empty string redirect path if TIMEOUT_REDIRECT is empty string', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                IdleTimeoutService,
                { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
                { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
                { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
                { provide: TIMEOUT_REDIRECT, useValue: '' },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: RedirectionService, useValue: redirectionServiceSpy }
            ],
        });
        service = TestBed.inject(IdleTimeoutService);
        Object.defineProperty(service, 'globalUrl', { value: '/some-page/', configurable: true });

        (service as any).timeoutTotalExpiredHandler();

        // Empty string is falsy but ?? operator treats it as defined, so it uses ''
        expect(redirectionServiceSpy.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '');
      });
    });
  });

  describe('Path Formatting', () => {
      it('should append slash to path if missing', () => {
          const path = 'test';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('test/');
      });

      it('should not append slash if already present', () => {
          const path = 'test/';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('test/');
      });

      it('should handle empty string path', () => {
          const path = '';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('/');
      });

      it('should handle root path correctly', () => {
          const path = '/';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('/');
      });

      it('should handle complex paths without trailing slash', () => {
          const path = '/some/complex/path';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('/some/complex/path/');
      });

      it('should handle complex paths with trailing slash', () => {
          const path = '/some/complex/path/';
          const formatted = (service as any).getFormattedPath(path);
          expect(formatted).toBe('/some/complex/path/');
      });
  });

  describe('globalUrl Initialization', () => {
    it('should initialize globalUrl from window location pathname', () => {
      // globalUrl is initialized from globalThis.location.pathname in constructor
      // We can verify it was set by checking it exists and is properly formatted
      expect((service as any).globalUrl).toBeDefined();
      expect((service as any).globalUrl).toMatch(/\/$/); // Should end with slash
    });
  });

  describe('Corporate Detection', () => {
    it('should detect corporate attribute correctly when present', () => {
      const div = document.createElement('div');
      div.setAttribute('corporate', '');
      document.body.appendChild(div);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const newService = TestBed.inject(IdleTimeoutService);

      expect((newService as any).isCorporate).toBe(true);
      newService.stopTimer();
    });

    it('should detect corporate as false when not present', () => {
      expect((service as any).isCorporate).toBe(false);
    });
  });

  describe('Edge Cases and Defensive Tests', () => {
    it('should handle multiple corporate elements', () => {
      const div1 = document.createElement('div');
      div1.setAttribute('corporate', '');
      document.body.appendChild(div1);
      
      const div2 = document.createElement('div');
      div2.setAttribute('corporate', '');
      document.body.appendChild(div2);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const newService = TestBed.inject(IdleTimeoutService);

      expect((newService as any).isCorporate).toBe(true);
      newService.stopTimer();
    });

    it('should handle extremely short timeout values', fakeAsync(() => {
      const shortAlertTime = 1;
      const shortExpiredTime = 2;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: shortAlertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: shortExpiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const newService = TestBed.inject(IdleTimeoutService);
      Object.defineProperty(newService, 'globalUrl', { value: '/page/', configurable: true });

      tick(shortAlertTime);
      expect(notificationServiceSpy.openModalTimeOut).toHaveBeenCalled();

      tick(shortExpiredTime - shortAlertTime);
      expect(redirectionServiceSpy.redirect).toHaveBeenCalled();

      newService.stopTimer();
    }));

    it('should handle zero timeout values gracefully', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: 0 },
          { provide: TIME_EXPIRED_SESSION, useValue: 0 },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      
      expect(() => {
        const newService = TestBed.inject(IdleTimeoutService);
        newService.stopTimer();
      }).not.toThrow();
    });

    it('should handle negative timeout values', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: -1000 },
          { provide: TIME_EXPIRED_SESSION, useValue: -2000 },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      
      const newService = TestBed.inject(IdleTimeoutService);
      tick(1000);
      newService.stopTimer();
      expect(newService).toBeTruthy();
    }));
  });

  describe('Integration Tests', () => {
    it('should execute full timeout flow from alert to redirect', fakeAsync(() => {
      // Reset mocks and stop existing timer
      notificationServiceSpy.openModalTimeOut.calls.reset();
      redirectionServiceSpy.redirect.calls.reset();
      service.stopTimer();
      
      // Create new service instance with proper global URL
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const testService = TestBed.inject(IdleTimeoutService);
      Object.defineProperty(testService, 'globalUrl', { value: '/booking/', configurable: true });
      
      tick(alertTime);
      expect(notificationServiceSpy.openModalTimeOut).toHaveBeenCalled();
      
      tick(expiredTime - alertTime);
      expect(redirectionServiceSpy.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect, 
        timeoutRedirect
      );
      
      testService.stopTimer();
    }));

    it('should reset flow when user interacts with modal', fakeAsync(() => {
      // Reset mocks and stop existing timer
      notificationServiceSpy.openModalTimeOut.calls.reset();
      redirectionServiceSpy.redirect.calls.reset();
      service.stopTimer();
      
      // Create new service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const testService = TestBed.inject(IdleTimeoutService);
      Object.defineProperty(testService, 'globalUrl', { value: '/booking/', configurable: true });
      
      tick(alertTime);
      expect(notificationServiceSpy.openModalTimeOut).toHaveBeenCalled();
      
      // User clicks on modal callback
      const callback = notificationServiceSpy.openModalTimeOut.calls.mostRecent().args[0];
      callback();
      
      // Timer should reset, so waiting another alertTime should trigger modal again
      notificationServiceSpy.openModalTimeOut.calls.reset();
      tick(alertTime);
      expect(notificationServiceSpy.openModalTimeOut).toHaveBeenCalled();
      
      testService.stopTimer();
    }));

    it('should not trigger any actions on root path', fakeAsync(() => {
      Object.defineProperty(service, 'globalUrl', { value: '/', configurable: true });
      
      tick(alertTime);
      expect(notificationServiceSpy.openModalTimeOut).not.toHaveBeenCalled();
      
      tick(expiredTime - alertTime);
      expect(redirectionServiceSpy.redirect).not.toHaveBeenCalled();
      
      service.stopTimer();
    }));

    it('should not trigger any actions when corporate is detected', fakeAsync(() => {
      const div = document.createElement('div');
      div.setAttribute('corporate', '');
      document.body.appendChild(div);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IdleTimeoutService,
          { provide: TIME_ALERT_EXPIRED_SESSION, useValue: alertTime },
          { provide: TIME_EXPIRED_SESSION, useValue: expiredTime },
          { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: excludedUrls },
          { provide: TIMEOUT_REDIRECT, useValue: timeoutRedirect },
          { provide: NotificationService, useValue: notificationServiceSpy },
          { provide: RedirectionService, useValue: redirectionServiceSpy }
        ],
      });
      const newService = TestBed.inject(IdleTimeoutService);
      Object.defineProperty(newService, 'globalUrl', { value: '/booking/', configurable: true });
      
      tick(alertTime);
      expect(notificationServiceSpy.openModalTimeOut).not.toHaveBeenCalled();
      
      tick(expiredTime - alertTime);
      expect(redirectionServiceSpy.redirect).not.toHaveBeenCalled();
      
      newService.stopTimer();
    }));
  });

  describe('Subject Observables', () => {
    it('should have timeoutExpiredShow as a Subject', (done) => {
      service.timeoutExpiredShow.subscribe((value) => {
        expect(value).toBeDefined();
        done();
      });
      
      service.timeoutExpiredShow.next(1);
    });

    it('should have timeoutTotalExpired as a Subject', (done) => {
      service.timeoutTotalExpired.subscribe((value) => {
        expect(value).toBeDefined();
        done();
      });
      
      service.timeoutTotalExpired.next(1);
    });
  });
});
