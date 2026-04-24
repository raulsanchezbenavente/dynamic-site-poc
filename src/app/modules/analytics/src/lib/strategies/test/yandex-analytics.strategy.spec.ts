import { TestBed } from '@angular/core/testing';
import { YandexMetricaService } from '../yandex-analytics.strategy';
import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';

describe('YandexMetricaService', () => {
  let service: YandexMetricaService;
  let ymSpy: jasmine.Spy;

  beforeEach(() => {
    // Mock the ym global function
    (window as any).ym = jasmine.createSpy('ym');
    ymSpy = (window as any).ym;

    TestBed.configureTestingModule({
      providers: [YandexMetricaService]
    });

    service = TestBed.inject(YandexMetricaService);
  });

  afterEach(() => {
    delete (window as any).ym;
  });

  describe('trackEvent', () => {
    const mockEvent: AnalyticsEvent = {
      eventName: 'page_view',
      data: {
        category: 'test_category',
        value: 123
      }
    };

    it('should track event with Yandex when available', () => {
      const accounts = ['12345'];

      service.trackEvent(mockEvent, accounts);

      expect(ymSpy).toHaveBeenCalledWith(
        '12345',
        'reachGoal',
        'page_view',
        { category: 'test_category', value: 123 }
      );
    });

    it('should track event for multiple accounts', () => {
      const accounts = ['12345', '67890'];

      service.trackEvent(mockEvent, accounts);

      expect(ymSpy).toHaveBeenCalledTimes(2);
      expect(ymSpy).toHaveBeenCalledWith(
        '12345',
        'reachGoal',
        'page_view',
        { category: 'test_category', value: 123 }
      );
      expect(ymSpy).toHaveBeenCalledWith(
        '67890',
        'reachGoal',
        'page_view',
        { category: 'test_category', value: 123 }
      );
    });

    it('should not track event when accounts array is empty', () => {
      service.trackEvent(mockEvent, []);

      expect(ymSpy).not.toHaveBeenCalled();
    });

    it('should not track event when accounts is undefined', () => {
      service.trackEvent(mockEvent);

      expect(ymSpy).not.toHaveBeenCalled();
    });

    it('should warn when Yandex is not available', () => {
      delete (window as any).ym;
      spyOn(console, 'warn');

      service.trackEvent(mockEvent, ['12345']);

      expect(console.warn).toHaveBeenCalledWith('Yandex is not available.');
    });

    it('should spread event data correctly', () => {
      const complexEvent: AnalyticsEvent = {
        eventName: 'checkout',
        data: {
          user: { id: 1, name: 'Test' },
          items: [1, 2, 3],
          nested: { prop: 'value' }
        }
      };

      service.trackEvent(complexEvent, ['12345']);

      expect(ymSpy).toHaveBeenCalledWith(
        '12345',
        'reachGoal',
        'checkout',
        complexEvent.data
      );
    });

    it('should log event info to console', () => {
      spyOn(console, 'debug');

      service.trackEvent(mockEvent, ['12345']);

      expect(console.debug).toHaveBeenCalledWith(
        'Yandex',
        'page_view',
        { category: 'test_category', value: 123 }
      );
    });
  });
});
