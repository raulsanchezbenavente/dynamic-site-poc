import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { PageViewStrategyService } from '@dcx/module/analytics';
import { AccountStateService, AnalyticsEventType, PageViewDataCollector } from '@dcx/ui/business-common';
import { BUSINESS_CONFIG, BusinessConfig } from '@dcx/ui/libs';
import { Subject } from 'rxjs';

import { PageViewInitializerService } from './page-view-initializer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PageViewInitializerService', () => {
  let service: PageViewInitializerService;
  let pageViewStrategyServiceMock: any;
  let pageViewDataCollectorMock: jasmine.SpyObj<PageViewDataCollector>;
  let accountStateServiceMock: any;
  let pageView$: Subject<void>;

  const mockPageViewData = {
    country_pos: 'CO',
    language: 'es-ES',
    language_nav: 'en',
    user_type: 'Guest',
    user_id: 'NA',
    ga_session_id: 123456789,
    page_location: 'https://example.com',
    page_referrer: '',
    page_title: 'Test Page',
    screen_resolution: '1920x1080',
    time_zone: 'GMT+01:00',
    user_hour: '14:30',
  };

  const businessConfigMock: BusinessConfig = {
      imagePopUpFrecuencyTime: 0,
      manageCountries: {},
      passengers: {},
      phoneValidationMessage: {},
      prefixValidationMessage: {},
      priceWithoutDecimals: false,
      roundingCurrencyFactors: [],
      cultureAlias: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
      {
        provide: BUSINESS_CONFIG, useValue: businessConfigMock },
  ],
    }).compileComponents();

    pageView$ = new Subject<void>();
    
    pageViewStrategyServiceMock = jasmine.createSpyObj('PageViewStrategyService', [
      'enablePageView',
      'sendPageViewEvent',
    ]);
    pageViewStrategyServiceMock.pageView$ = pageView$.asObservable();
    
    pageViewDataCollectorMock = jasmine.createSpyObj('PageViewDataCollector', ['collectPageViewData']);
    
    // Create a signal-based mock for accountDto
    const accountDtoSignal = signal(null);
    accountStateServiceMock = {
      getAccountData: jasmine.createSpy('getAccountData').and.returnValue(null),
      accountDto: accountDtoSignal.asReadonly(),
      _setAccountDto: (value: any) => accountDtoSignal.set(value), // Helper for tests
    };

    pageViewDataCollectorMock.collectPageViewData.and.returnValue(mockPageViewData as any);

    TestBed.configureTestingModule({
      providers: [
        PageViewInitializerService,
        { provide: PageViewStrategyService, useValue: pageViewStrategyServiceMock },
        { provide: PageViewDataCollector, useValue: pageViewDataCollectorMock },
        { provide: AccountStateService, useValue: accountStateServiceMock },
      ],
    });

    // Create service within injection context to ensure toObservable() works
    TestBed.runInInjectionContext(() => {
      service = TestBed.inject(PageViewInitializerService);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should enable page view strategy', () => {
      TestBed.runInInjectionContext(() => {
        service.initialize();
      });

      expect(pageViewStrategyServiceMock.enablePageView).toHaveBeenCalledWith(true);
    });

    it('should send page view immediately if account data is already loaded', () => {
      accountStateServiceMock.getAccountData.and.returnValue({ customerNumber: '12345' });

      TestBed.runInInjectionContext(() => {
        service.initialize();
        pageView$.next();
      });

      expect(pageViewStrategyServiceMock.enablePageView).toHaveBeenCalledWith(true);
      expect(pageViewDataCollectorMock.collectPageViewData).toHaveBeenCalled();
      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledWith(AnalyticsEventType.PAGE_VIEW, mockPageViewData);
    });

    it('should wait for account data to load before sending page view', fakeAsync(() => {
      accountStateServiceMock.getAccountData.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        service.initialize();
        pageView$.next(); // Trigger page view event
      });

      expect(pageViewStrategyServiceMock.enablePageView).toHaveBeenCalledWith(true);
      // Waiting for account data, not sent yet
      expect(pageViewStrategyServiceMock.sendPageViewEvent).not.toHaveBeenCalled();
      
      // Simulate account data loading
      accountStateServiceMock._setAccountDto({ customerNumber: '12345' });
      TestBed.flushEffects(); // Flush effects to trigger toObservable() emission
      tick();
      flush();

      expect(pageViewDataCollectorMock.collectPageViewData).toHaveBeenCalled();
      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledWith(AnalyticsEventType.PAGE_VIEW, mockPageViewData);
    }));

    it('should send page view after timeout if account data never loads', fakeAsync(() => {
      accountStateServiceMock.getAccountData.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        service.initialize();
        pageView$.next(); // Trigger page view event
      });

      // Waiting for account data, not sent yet
      expect(pageViewStrategyServiceMock.sendPageViewEvent).not.toHaveBeenCalled();

      // Fast-forward time by 10 seconds (timeout)
      tick(10000);
      flush();

      expect(pageViewDataCollectorMock.collectPageViewData).toHaveBeenCalled();
      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledWith(AnalyticsEventType.PAGE_VIEW, mockPageViewData);
    }));

    it('should cancel timeout if account data loads before timeout', fakeAsync(() => {
      accountStateServiceMock.getAccountData.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        service.initialize();
        pageView$.next(); // Trigger page view event
      });

      // Not sent yet, waiting for account data
      expect(pageViewStrategyServiceMock.sendPageViewEvent).not.toHaveBeenCalled();

      // Load account data after 5 seconds
      tick(5000);
      accountStateServiceMock._setAccountDto({ customerNumber: '12345' });
      TestBed.flushEffects(); // Flush effects to trigger toObservable() emission
      tick();
      flush();

      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledTimes(1);

      // Continue to timeout
      tick(5000);
      flush();

      // Should still only be called once (timeout was cancelled)
      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledTimes(1);
    }));

    it('should send page view only once due to pageViewSent flag', fakeAsync(() => {
      accountStateServiceMock.getAccountData.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        service.initialize();
        
        // First navigation event
        pageView$.next();
        
        // Waiting for account data, not sent yet
        expect(pageViewStrategyServiceMock.sendPageViewEvent).not.toHaveBeenCalled();
        
        // Load account data
        accountStateServiceMock._setAccountDto({ customerNumber: '12345' });
        TestBed.flushEffects();
        tick();
        flush();

        expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledTimes(1);

        // Second navigation event - should NOT send again because pageViewSent is true
        pageView$.next();
        tick();
        flush();

        // Still only called once due to pageViewSent flag
        expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledTimes(1);
      });
    }));

    it('should collect fresh page view data when sending', () => {
      accountStateServiceMock.getAccountData.and.returnValue({ customerNumber: '12345' });

      TestBed.runInInjectionContext(() => {
        service.initialize();
        pageView$.next();
      });

      expect(pageViewDataCollectorMock.collectPageViewData).toHaveBeenCalled();
      expect(pageViewStrategyServiceMock.sendPageViewEvent).toHaveBeenCalledWith(AnalyticsEventType.PAGE_VIEW, mockPageViewData);
    });
  });
});
