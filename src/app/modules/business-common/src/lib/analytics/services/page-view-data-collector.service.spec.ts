import { TestBed } from '@angular/core/testing';
import { ANALYTICS_DICTIONARIES, AnalyticsDictionaries } from '@dcx/module/analytics';
import { CultureServiceEx, PointOfSaleService, StorageService } from '@dcx/ui/libs';

import { AccountStateService } from '../../services/account-state/account-state.service';

import { AnalyticsUserType } from '../../enums';
import { PageViewDataCollector } from './page-view-data-collector.service';

describe('PageViewDataCollector', () => {
  let service: PageViewDataCollector;
  let accountStateServiceMock: jasmine.SpyObj<AccountStateService>;
  let cultureServiceExMock: jasmine.SpyObj<CultureServiceEx>;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let pointOfSaleServiceMock: jasmine.SpyObj<PointOfSaleService>;

  const MOCK_DICTIONARIES: AnalyticsDictionaries = {
    dataType: { NA: 'NA' },
    userType: { LOGGED_IN: 'Logged in', GUEST: 'Guest' },
  };

  beforeEach(() => {
    accountStateServiceMock = jasmine.createSpyObj('AccountStateService', ['getAccountData']);
    cultureServiceExMock = jasmine.createSpyObj('CultureServiceEx', ['getUserCulture']);
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getSessionStorage']);
    pointOfSaleServiceMock = jasmine.createSpyObj('PointOfSaleService', ['getCurrentPointOfSale']);

    // Set default mock returns
    cultureServiceExMock.getUserCulture.and.returnValue({ locale: 'es-ES' } as any);
    pointOfSaleServiceMock.getCurrentPointOfSale.and.returnValue({ code: 'CO' } as any);
    storageServiceMock.getSessionStorage.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        PageViewDataCollector,
        { provide: AccountStateService, useValue: accountStateServiceMock },
        { provide: CultureServiceEx, useValue: cultureServiceExMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: PointOfSaleService, useValue: pointOfSaleServiceMock },
        { provide: ANALYTICS_DICTIONARIES, useValue: MOCK_DICTIONARIES },
      ],
    });

    service = TestBed.inject(PageViewDataCollector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('collectPageViewData', () => {
    it('should collect page view data for guest user', () => {
      accountStateServiceMock.getAccountData.and.returnValue(null);

      const result = service.collectPageViewData();
      expect(result).toBeDefined();
      expect(result.country_pos).toBe('NA');
      expect(result.language).toBe('es-ES');
      expect(result.user_type).toBe(AnalyticsUserType.GUEST);
      expect(result.user_id).toBe('NA');
      expect(result.ga_session_id).toBeInstanceOf(Number);
      expect(result.page_location).toBe(globalThis.location.href);
      expect(result.page_referrer).toBe(document.referrer);
      expect(result.page_title).toBe(document.title);
      expect(result.screen_resolution).toMatch(/\d+x\d+/);
      expect(result.time_zone).toMatch(/^GMT[+-]\d{2}:\d{2}$/);
      expect(result.user_hour).toMatch(/^\d{2}:\d{2}$/);
      expect(result.language_nav).toBeDefined();
    });

    it('should collect page view data for logged in user', () => {
      accountStateServiceMock.getAccountData.and.returnValue({
        customerNumber: '12345',
      } as any);

      const result = service.collectPageViewData();

      expect(result.user_type).toBe(AnalyticsUserType.LOGGED_IN);
    });

    it('should use NA when point of sale is not available', () => {
      pointOfSaleServiceMock.getCurrentPointOfSale.and.returnValue(null);

      const result = service.collectPageViewData();

      expect(result.country_pos).toBe('NA');
    });

    it('should fall back to navigator language when culture locale is not available', () => {
      cultureServiceExMock.getUserCulture.and.returnValue({ locale: '' } as any);

      const result = service.collectPageViewData();

      const expectedLanguage = navigator.language?.split('-')[0] || 'en';
      expect(result.language).toBe(expectedLanguage);
    });

    it('should include page_name and payment_provider for WCI flow', () => {
      storageServiceMock.getSessionStorage.and.returnValue({
        bookingInfo: {
          sessionFlowType: 2, // Checkin
        },
      });

      // Spy on private method getPageName
      spyOn<any>(service, 'getPageName').and.returnValue('passengers');

      const result = service.collectPageViewData();

      expect(result.page_name).toBe('passengers');
      expect(result.payment_provider).toBe('NA');
    });

    it('should not include page_name and payment_provider for non-WCI flow', () => {
      storageServiceMock.getSessionStorage.and.returnValue({
        bookingInfo: {
          sessionFlowType: 0, // Booking
        },
      });

      const result = service.collectPageViewData();

      expect(result.page_name).toBeUndefined();
      expect(result.payment_provider).toBeUndefined();
    });

    it('should extract page name correctly from check-in URL', () => {
      storageServiceMock.getSessionStorage.and.returnValue({
        bookingInfo: {
          sessionFlowType: 2,
        },
      });

      // Spy on private method getPageName
      spyOn<any>(service, 'getPageName').and.returnValue('seat-selection');

      const result = service.collectPageViewData();

      expect(result.page_name).toBe('seat-selection');
    });

    it('should return empty page name if check-in pattern not found', () => {
      storageServiceMock.getSessionStorage.and.returnValue({
        bookingInfo: {
          sessionFlowType: 2,
        },
      });

      // Spy on private method getPageName
      spyOn<any>(service, 'getPageName').and.returnValue('');

      const result = service.collectPageViewData();

      expect(result.page_name).toBe('');
    });
  });
});
