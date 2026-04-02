import { TestBed } from '@angular/core/testing';
import { GTMService } from '../gtm-analytics.strategy';
import { AnalyticsStrategiesService } from '../services/analytics-strategies.service';
import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';

declare const globalThis: any;

const mockAnalyticsStrategiesService = {
  normalizeEvent: jasmine.createSpy('normalizeEvent').and.callFake((event: AnalyticsEvent) => event.data)
};

describe('GTMService', () => {
  let service: GTMService;
  let analyticsStrategiesService: jasmine.SpyObj<AnalyticsStrategiesService>;
  let originalDataLayer: any;
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
    originalDataLayer = globalThis.dataLayer;
    globalThis.dataLayer = [];
    consoleWarnSpy = spyOn(console, 'warn');
    consoleInfoSpy = spyOn(console, 'debug');

    TestBed.configureTestingModule({
      providers: [
        GTMService,
        { provide: AnalyticsStrategiesService, useValue: mockAnalyticsStrategiesService }
      ]
    });

    service = TestBed.inject(GTMService);
    analyticsStrategiesService = TestBed.inject(AnalyticsStrategiesService) as jasmine.SpyObj<AnalyticsStrategiesService>;
  });

  afterEach(() => {
    globalThis.dataLayer = originalDataLayer;
    mockAnalyticsStrategiesService.normalizeEvent.calls.reset();
  });

  describe('trackEvent', () => {
    it('should push event to dataLayer when GTM is available', () => {
      service.trackEvent(mockEvent);

      expect(globalThis.dataLayer.length).toBe(1);
      expect(globalThis.dataLayer[0]).toEqual({
        event: 'page_view',
        page_location: '/test',
        page_title: 'Test Page'
      });
    });

    it('should normalize event before pushing', () => {
      service.trackEvent(mockEvent);

      expect(analyticsStrategiesService.normalizeEvent).toHaveBeenCalledWith(mockEvent);
    });

    it('should log event info to console', () => {
      service.trackEvent(mockEvent);

      expect(consoleInfoSpy).toHaveBeenCalledWith('GTM', 'page_view', mockEvent.data);
    });

    it('should log warning when GTM is not available', () => {
      globalThis.dataLayer = undefined;

      service.trackEvent(mockEvent);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Google Tag Manager is not available.');
      expect(globalThis.dataLayer).toBeUndefined();
    });

    it('should not push to dataLayer when GTM is not available', () => {
      globalThis.dataLayer = null;

      service.trackEvent(mockEvent);

      expect(analyticsStrategiesService.normalizeEvent).not.toHaveBeenCalled();
    });

    it('should handle dataLayer being an object instead of array', () => {
      globalThis.dataLayer = {};

      service.trackEvent(mockEvent);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Google Tag Manager is not available.');
    });

    it('should push multiple events', () => {
      const event2: AnalyticsEvent = {
        eventName: 'purchase',
        data: { transaction_id: '123' }
      };

      service.trackEvent(mockEvent);
      service.trackEvent(event2);

      expect(globalThis.dataLayer.length).toBe(2);
      expect(globalThis.dataLayer[1].event).toBe('purchase');
    });

    it('should merge event name with data', () => {
      const eventWithMultipleFields: AnalyticsEvent = {
        eventName: 'add_to_cart',
        data: {
          item_name: 'Flight',
          value: 500,
          currency: 'USD'
        }
      };

      service.trackEvent(eventWithMultipleFields);

      expect(globalThis.dataLayer[0]).toEqual({
        event: 'add_to_cart',
        item_name: 'Flight',
        value: 500,
        currency: 'USD'
      });
    });
  });
});
