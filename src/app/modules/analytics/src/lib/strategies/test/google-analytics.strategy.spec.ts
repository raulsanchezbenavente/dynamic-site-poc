import { TestBed } from '@angular/core/testing';
import { GoogleAnalyticsService } from '../google-analytics.strategy';
import { AnalyticsStrategiesService } from '../services/analytics-strategies.service';
import { AnalyticsGaGtmColivingRewriteService } from '../../workdarounds/GA-GTM-coliving/analytics-ga-gtm-coliving-rewrite.service';
import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';

declare global {
  interface Window {
    gtag?: any;
  }
}

const mockAnalyticsStrategiesService = {
  normalizeEvent: jasmine.createSpy('normalizeEvent').and.callFake((event: AnalyticsEvent, account?: string) => ({
    ...event.data,
    send_to: account
  }))
};

const mockAnalyticsGaGtmColivingRewriteService = {
  gtagWithSuffix: jasmine.createSpy('gtagWithSuffix')
};

describe('GoogleAnalyticsService', () => {
  let service: GoogleAnalyticsService;
  let analyticsStrategiesService: jasmine.SpyObj<AnalyticsStrategiesService>;
  let analyticsGaGtmColivingRewriteService: jasmine.SpyObj<AnalyticsGaGtmColivingRewriteService>;
  let originalGtag: any;
  let consoleWarnSpy: jasmine.Spy;
  let consoleInfoSpy: jasmine.Spy;

  const mockEvent: AnalyticsEvent = {
    eventName: 'page_view',
    data: {
      page_location: '/test',
      page_title: 'Test Page'
    }
  };

  beforeEach(() => {
    originalGtag = (window as any).gtag;
    (window as any).gtag = jasmine.createSpy('gtag');
    consoleWarnSpy = spyOn(console, 'warn');
    consoleInfoSpy = spyOn(console, 'debug');

    TestBed.configureTestingModule({
      providers: [
        GoogleAnalyticsService,
        { provide: AnalyticsStrategiesService, useValue: mockAnalyticsStrategiesService },
        { provide: AnalyticsGaGtmColivingRewriteService, useValue: mockAnalyticsGaGtmColivingRewriteService }
      ]
    });

    service = TestBed.inject(GoogleAnalyticsService);
    analyticsStrategiesService = TestBed.inject(AnalyticsStrategiesService) as jasmine.SpyObj<AnalyticsStrategiesService>;
    analyticsGaGtmColivingRewriteService = TestBed.inject(AnalyticsGaGtmColivingRewriteService) as jasmine.SpyObj<AnalyticsGaGtmColivingRewriteService>;
  });

  afterEach(() => {
    (window as any).gtag = originalGtag;
    mockAnalyticsStrategiesService.normalizeEvent.calls.reset();
    mockAnalyticsGaGtmColivingRewriteService.gtagWithSuffix.calls.reset();
  });

  describe('trackEvent', () => {
    it('should track event when gtag is available', () => {
      service.trackEvent(mockEvent);

      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).toHaveBeenCalledWith(
        'event',
        'page_view',
        jasmine.any(Object)
      );
    });

    it('should track event for each account when accounts array is provided', () => {
      const accounts = ['G-ACCOUNT1', 'G-ACCOUNT2'];

      service.trackEvent(mockEvent, accounts);

      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).toHaveBeenCalledTimes(2);
    });

    it('should normalize event with account when provided', () => {
      const accounts = ['G-ACCOUNT1'];

      service.trackEvent(mockEvent, accounts);

      expect(analyticsStrategiesService.normalizeEvent).toHaveBeenCalledWith(mockEvent, 'G-ACCOUNT1');
    });

    it('should normalize event without account when not provided', () => {
      service.trackEvent(mockEvent);

      expect(analyticsStrategiesService.normalizeEvent).toHaveBeenCalledWith(mockEvent, undefined);
    });

    it('should log warning when gtag is not available', () => {
      delete (window as any).gtag;

      service.trackEvent(mockEvent);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Google Analytics is not available.');
      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).not.toHaveBeenCalled();
    });

    it('should handle empty accounts array', () => {
      service.trackEvent(mockEvent, []);

      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendEvent', () => {
    it('should send event with normalized data', () => {
      service.sendEvent(mockEvent);

      expect(analyticsStrategiesService.normalizeEvent).toHaveBeenCalledWith(mockEvent, undefined);
      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).toHaveBeenCalled();
    });

    it('should send event with account', () => {
      service.sendEvent(mockEvent, 'G-ACCOUNT1');

      expect(analyticsStrategiesService.normalizeEvent).toHaveBeenCalledWith(mockEvent, 'G-ACCOUNT1');
    });

    it('should log event info to console', () => {
      service.sendEvent(mockEvent);

      expect(consoleInfoSpy).toHaveBeenCalledWith('GA', 'page_view', jasmine.any(Object));
    });

    it('should call gtagWithSuffix with correct parameters', () => {
      const normalizedEvent = { page_location: '/test', send_to: 'G-ACCOUNT1' };
      mockAnalyticsStrategiesService.normalizeEvent.and.returnValue(normalizedEvent);

      service.sendEvent(mockEvent, 'G-ACCOUNT1');

      expect(analyticsGaGtmColivingRewriteService.gtagWithSuffix).toHaveBeenCalledWith(
        'event',
        'page_view',
        normalizedEvent
      );
    });
  });
});
