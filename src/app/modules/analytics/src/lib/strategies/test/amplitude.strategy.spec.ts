import { TestBed } from '@angular/core/testing';
import { AmplitudeService } from '../amplitude.strategy';
import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';

declare const amplitude: any;

describe('AmplitudeService', () => {
  let service: AmplitudeService;
  let originalAmplitude: any;
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
    originalAmplitude = (window as any).amplitude;
    (window as any).amplitude = {
      track: jasmine.createSpy('track')
    };
    consoleWarnSpy = spyOn(console, 'warn');
    consoleInfoSpy = spyOn(console, 'debug');

    TestBed.configureTestingModule({
      providers: [AmplitudeService]
    });

    service = TestBed.inject(AmplitudeService);
  });

  afterEach(() => {
    (window as any).amplitude = originalAmplitude;
  });

  describe('trackEvent', () => {
    it('should track event when Amplitude is available', () => {
      service.trackEvent(mockEvent);

      expect((window as any).amplitude.track).toHaveBeenCalledWith(
        'page_view',
        mockEvent.data
      );
    });

    it('should log event info to console', () => {
      service.trackEvent(mockEvent);

      expect(consoleInfoSpy).toHaveBeenCalledWith('Amplitude', 'page_view', mockEvent.data);
    });

    it('should log warning when Amplitude is not available', () => {
      (window as any).amplitude = undefined;

      service.trackEvent(mockEvent);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Amplitude is not available.');
    });

    it('should not track when Amplitude is not available', () => {
      const trackSpy = jasmine.createSpy('track');
      (window as any).amplitude = undefined;

      service.trackEvent(mockEvent);

      expect(trackSpy).not.toHaveBeenCalled();
    });

    it('should spread event data correctly', () => {
      const eventWithMultipleFields: AnalyticsEvent = {
        eventName: 'purchase',
        data: {
          transaction_id: '123',
          value: 500,
          currency: 'USD',
          items: []
        }
      };

      service.trackEvent(eventWithMultipleFields);

      expect((window as any).amplitude.track).toHaveBeenCalledWith(
        'purchase',
        {
          transaction_id: '123',
          value: 500,
          currency: 'USD',
          items: []
        }
      );
    });

    it('should handle empty data object', () => {
      const eventWithoutData: AnalyticsEvent = {
        eventName: 'page_view',
        data: {}
      };

      service.trackEvent(eventWithoutData);

      expect((window as any).amplitude.track).toHaveBeenCalledWith(
        'page_view',
        {}
      );
    });
  });
});
