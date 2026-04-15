import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from '@dcx/module/analytics';
import { AnalyticsEventType, ErrorPageDataCollector } from '@dcx/ui/business-common';
import { PageErrorEnum } from '../enums/page-error.enum';
import { Page404TrackerService } from './page-404-tracker.service';

describe('Page404TrackerService', () => {
  let service: Page404TrackerService;
  let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;
  let mockErrorPageDataCollector: jasmine.SpyObj<ErrorPageDataCollector>;

  beforeEach(() => {
    mockAnalyticsService = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);
    mockErrorPageDataCollector = jasmine.createSpyObj('ErrorPageDataCollector', ['collect']);

    mockErrorPageDataCollector.collect.and.returnValue({
      error_id: '404',
      error_desc: 'Page not found',
    } as any);

    TestBed.configureTestingModule({
      providers: [
        Page404TrackerService,
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: ErrorPageDataCollector, useValue: mockErrorPageDataCollector },
      ],
    });

    service = TestBed.inject(Page404TrackerService);
  });

  afterEach(() => {
    const errorPageElement = document.querySelector('[error-page-attribute]');
    if (errorPageElement) {
      errorPageElement.remove();
    }
    
    mockAnalyticsService.trackEvent.calls.reset();
    mockErrorPageDataCollector.collect.calls.reset();
  });

  describe('initialize', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should track 404 error when error-page-attribute element exists', () => {
      const errorPageElement = document.createElement('div');
      errorPageElement.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockErrorPageDataCollector.collect).toHaveBeenCalledWith(
        PageErrorEnum.ERROR_CODE,
        PageErrorEnum.ERROR_DESCRIPTION
      );
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        eventName: AnalyticsEventType.PAGE_ERROR,
        data: jasmine.any(Object),
      });

      errorPageElement.remove();
    });

    it('should not track event if error-page-attribute element does not exist', () => {
      service.initialize();

      expect(mockErrorPageDataCollector.collect).not.toHaveBeenCalled();
      expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled();
    });
  });

  describe('error page detection', () => {
    it('should detect element with error-page-attribute', () => {
      const errorPageElement = document.createElement('div');
      errorPageElement.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();

      errorPageElement.remove();
    });

    it('should detect element with error-page-attribute regardless of value', () => {
      const errorPageElement = document.createElement('div');
      errorPageElement.setAttribute('error-page-attribute', 'any-value');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();

      errorPageElement.remove();
    });

    it('should not detect elements without error-page-attribute', () => {
      const normalElement = document.createElement('div');
      document.body.appendChild(normalElement);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled();

      normalElement.remove();
    });
  });

  describe('event data collection', () => {
    it('should collect error data with correct error code and description', () => {
      const errorPageElement = document.createElement('div');
      errorPageElement.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockErrorPageDataCollector.collect).toHaveBeenCalledWith(
        PageErrorEnum.ERROR_CODE,
        PageErrorEnum.ERROR_DESCRIPTION
      );

      errorPageElement.remove();
    });

    it('should pass collected data to analytics service', () => {
      const mockEventData = {
        error_id: '404',
        error_desc: 'Page not found',
        page_location: 'https://example.com/not-found',
        user_type: 'Guest',
      };

      mockErrorPageDataCollector.collect.and.returnValue(mockEventData as any);

      const errorPageElement = document.createElement('div');
      errorPageElement.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        eventName: AnalyticsEventType.PAGE_ERROR,
        data: mockEventData,
      });

      errorPageElement.remove();
    });
  });

  describe('edge cases', () => {
    it('should not throw error when no error-page-attribute element exists', () => {
      expect(() => service.initialize()).not.toThrow();
      expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled();
    });

    it('should handle multiple error-page-attribute elements (only detects first)', () => {
      const errorPageElement1 = document.createElement('div');
      errorPageElement1.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement1);

      const errorPageElement2 = document.createElement('div');
      errorPageElement2.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement2);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledTimes(1);

      errorPageElement1.remove();
      errorPageElement2.remove();
    });

    it('should work with different element types', () => {
      const errorPageElement = document.createElement('section');
      errorPageElement.setAttribute('error-page-attribute', '');
      document.body.appendChild(errorPageElement);

      service.initialize();

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();

      errorPageElement.remove();
    });
  });
});
