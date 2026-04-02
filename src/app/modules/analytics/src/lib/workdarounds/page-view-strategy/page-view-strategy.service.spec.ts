import { TestBed } from '@angular/core/testing';
import { PageViewStrategyService } from './page-view-strategy.service';
import { AnalyticsService } from '../../services/analytics.service';
import { CultureServiceEx, PointOfSaleService, StorageService } from '@dcx/ui/libs';
import {
  ANALYTICS_DICTIONARIES,
  ANALYTICS_EXPECTED_EVENTS,
  type AnalyticsDictionaries,
  type AnalyticsEventNames,
} from '../../tokens/analytics-expected-keys.token';

// Mock helpers
const createAnalyticsServiceMock = () => ({
  trackEvent: jasmine.createSpy('trackEvent'),
});

const createCultureServiceMock = () => ({
  getUserCulture: jasmine.createSpy('getUserCulture'),
});

const createStorageServiceMock = () => ({
  getSessionStorage: jasmine.createSpy('getSessionStorage'),
});

const createPointOfSaleServiceMock = () => ({
  getCurrentPointOfSale: jasmine.createSpy('getCurrentPointOfSale'),
});

// Token mocks
const MOCK_EVENT_NAMES: AnalyticsEventNames = {
  PAGE_VIEW: 'page_view',
};

const MOCK_DICTIONARIES: AnalyticsDictionaries = {
  dataType: { NA: 'NA' },
  userType: { LOGGED_IN: 'Logged in', GUEST: 'Guest' },
};

describe('PageViewStrategyService', () => {
  let service: PageViewStrategyService;

  let analyticsServiceMock: ReturnType<typeof createAnalyticsServiceMock>;
  let cultureServiceExMock: ReturnType<typeof createCultureServiceMock>;
  let storageServiceMock: ReturnType<typeof createStorageServiceMock>;
  let pointOfSaleServiceMock: ReturnType<typeof createPointOfSaleServiceMock>;

  beforeEach(() => {
    analyticsServiceMock = createAnalyticsServiceMock();
    cultureServiceExMock = createCultureServiceMock();
    storageServiceMock = createStorageServiceMock();
    pointOfSaleServiceMock = createPointOfSaleServiceMock();

    // Performance stub so that initializePageViewStrategy has navigation
    spyOn(performance as any, 'getEntriesByType').and.returnValue([
      { type: 'back_forward' } as PerformanceNavigationTiming,
    ]);

    // Culture, Storage and PointOfSale defaults
    cultureServiceExMock.getUserCulture.and.returnValue({ locale: 'es-ES' });
    storageServiceMock.getSessionStorage.and.returnValue(null);
    pointOfSaleServiceMock.getCurrentPointOfSale.and.returnValue({ code: 'CO' });

    TestBed.configureTestingModule({
      providers: [
        PageViewStrategyService,
        { provide: AnalyticsService, useValue: analyticsServiceMock },
        { provide: CultureServiceEx, useValue: cultureServiceExMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PointOfSaleService, useValue: pointOfSaleServiceMock },
        { provide: ANALYTICS_EXPECTED_EVENTS, useValue: MOCK_EVENT_NAMES },
        { provide: ANALYTICS_DICTIONARIES, useValue: MOCK_DICTIONARIES },
      ],
    });

    service = TestBed.inject(PageViewStrategyService);
  });

  afterEach(() => {
    // in case we use fake timers below
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe to feature flag and update enableAnalyticsPageView', () => {
    const anyService = service as any;
    expect(anyService.enableAnalyticsPageView).toBeFalse();

    service.enablePageView(true);
    expect(anyService.enableAnalyticsPageView).toBeTrue();

    service.enablePageView(false);
    expect(anyService.enableAnalyticsPageView).toBeFalse();
  });

  it('should not call trackEvent if enableAnalyticsPageView is false', () => {
    const anyService = service as any;

    anyService.enablePageView(false);

    expect(analyticsServiceMock.trackEvent).not.toHaveBeenCalled();
  });

  it('should call trackEvent with correct data when enableAnalyticsPageView is true', () => {
    const anyService = service as any;
    anyService.enableAnalyticsPageView = true;

    const mockPageViewData = {
      country_pos: 'CO',
      language: 'es-ES',
      language_nav: 'en',
      user_type:  'Guest',
      user_id: 'NA',
      ga_session_id: 123456789,
      page_location: 'https://example.com',
      page_referrer: '',
      page_title: 'Test Page',
      screen_resolution: '1920x1080',
      time_zone: 'GMT+01:00',
      user_hour: '14:30',
    };

    service.sendPageViewEvent('page_view', mockPageViewData);

    expect(analyticsServiceMock.trackEvent).toHaveBeenCalledTimes(1);
    const arg = analyticsServiceMock.trackEvent.calls.mostRecent().args[0];

    expect(arg.eventName).toBe('page_view');
    expect(arg.data).toEqual(mockPageViewData);
  });
});
