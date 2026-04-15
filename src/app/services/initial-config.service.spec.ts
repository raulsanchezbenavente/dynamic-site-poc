import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AnalyticsGaGtmColivingRewriteService, AnalyticsService } from '@dcx/module/analytics';
import { AnalyticsSettingsFacade, PointOfSalesFacade } from '@dcx/module/api-clients';
import { CutureConfigService } from '@dcx/ui/business-common';
import { PointOfSaleService } from '@dcx/ui/libs';
import { of } from 'rxjs';

import { PageViewInitializerService } from './page-view-initializer.service';
import { StorageSyncService } from './storage-sync.service';
import { InitialConfigService } from './initial-config.service';

class MockPointOfSalesFacade {
  getPointOfSales = jasmine.createSpy('getPointOfSales').and.returnValue(of(null));
}

class MockAnalyticsSettingsFacade {
  getAnalyticsSettings = jasmine.createSpy('getAnalyticsSettings').and.returnValue(of(null));
}

class MockPointOfSaleService {
  initializePointsOfSale = jasmine.createSpy('initializePointsOfSale');
  getCurrentPointOfSale = jasmine.createSpy('getCurrentPointOfSale').and.returnValue(null);
}

class MockStorageSyncService {
  syncFromStorage = jasmine.createSpy('syncFromStorage');
}

class MockAnalyticsService {
  setConfig = jasmine.createSpy('setConfig');
}

class MockPageViewInitializerService {
  initialize = jasmine.createSpy('initialize');
}

class MockAnalyticsGaGtmColivingRewriteService {
  initGaGtmColiving = jasmine.createSpy('initGaGtmColiving');
}

class MockCutureConfigService {
  setInitialCulture = jasmine.createSpy('setInitialCulture');
}

describe('InitialConfigService', () => {
  let service: InitialConfigService;
  let posFacade: MockPointOfSalesFacade;
  let analyticsSettingsFacade: MockAnalyticsSettingsFacade;
  let pointOfSaleService: MockPointOfSaleService;
  let storageSyncService: MockStorageSyncService;
  let analyticsService: MockAnalyticsService;
  let pageViewInitializerService: MockPageViewInitializerService;
  let analyticsGaGtmColivingRewriteService: MockAnalyticsGaGtmColivingRewriteService;
  let cultureConfigService: MockCutureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InitialConfigService,
        { provide: PointOfSalesFacade, useClass: MockPointOfSalesFacade },
        { provide: AnalyticsSettingsFacade, useClass: MockAnalyticsSettingsFacade },
        { provide: PointOfSaleService, useClass: MockPointOfSaleService },
        { provide: StorageSyncService, useClass: MockStorageSyncService },
        { provide: AnalyticsService, useClass: MockAnalyticsService },
        { provide: PageViewInitializerService, useClass: MockPageViewInitializerService },
        { provide: AnalyticsGaGtmColivingRewriteService, useClass: MockAnalyticsGaGtmColivingRewriteService },
        { provide: CutureConfigService, useClass: MockCutureConfigService },
      ],
    });

    service = TestBed.inject(InitialConfigService);
    document.body.classList.remove('keyboard-focus-mode');
    posFacade = TestBed.inject(PointOfSalesFacade) as unknown as MockPointOfSalesFacade;
    analyticsSettingsFacade = TestBed.inject(AnalyticsSettingsFacade) as unknown as MockAnalyticsSettingsFacade;
    pointOfSaleService = TestBed.inject(PointOfSaleService) as unknown as MockPointOfSaleService;
    storageSyncService = TestBed.inject(StorageSyncService) as unknown as MockStorageSyncService;
    analyticsService = TestBed.inject(AnalyticsService) as unknown as MockAnalyticsService;
    pageViewInitializerService = TestBed.inject(PageViewInitializerService) as unknown as MockPageViewInitializerService;
    analyticsGaGtmColivingRewriteService = TestBed.inject(
      AnalyticsGaGtmColivingRewriteService
    ) as unknown as MockAnalyticsGaGtmColivingRewriteService;
    cultureConfigService = TestBed.inject(CutureConfigService) as unknown as MockCutureConfigService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializePointOfSales', () => {
    it('should initialize points of sale and sync storage when items are returned', () => {
      const mockItems = [{ code: 'POS1' }];
      posFacade.getPointOfSales.and.returnValue(of(mockItems));

      service.initializePointOfSales();

      expect(pointOfSaleService.initializePointsOfSale).toHaveBeenCalledWith(mockItems);
      expect(storageSyncService.syncFromStorage).toHaveBeenCalled();
      expect(cultureConfigService.setInitialCulture).toHaveBeenCalled();
    });

    it('should not initialize points of sale when items are null', () => {
      posFacade.getPointOfSales.and.returnValue(of(null));

      service.initializePointOfSales();

      expect(pointOfSaleService.initializePointsOfSale).not.toHaveBeenCalled();
      expect(storageSyncService.syncFromStorage).not.toHaveBeenCalled();
      expect(cultureConfigService.setInitialCulture).toHaveBeenCalled();
    });
  });

  describe('initializeAnalyticsSettings', () => {
    it('should set analytics config and initialize page view when settings are provided', () => {
      const mockSettings = {
        analyticsConfig: { trackingId: '123' },
        activateCustomPageViewEvent: true,
        gaGtmColiving: true,
      };
      analyticsSettingsFacade.getAnalyticsSettings.and.returnValue(of(mockSettings));

      service.initializeAnalyticsSettings();

      expect(analyticsService.setConfig).toHaveBeenCalledWith(mockSettings.analyticsConfig);
      expect(pageViewInitializerService.initialize).toHaveBeenCalled();
      expect(analyticsGaGtmColivingRewriteService.initGaGtmColiving).toHaveBeenCalledWith(true);
    });

    it('should not initialize page view when activateCustomPageViewEvent is false', () => {
      const mockSettings = {
        analyticsConfig: { trackingId: '123' },
        activateCustomPageViewEvent: false,
        gaGtmColiving: false,
      };
      analyticsSettingsFacade.getAnalyticsSettings.and.returnValue(of(mockSettings));

      service.initializeAnalyticsSettings();

      expect(analyticsService.setConfig).toHaveBeenCalledWith(mockSettings.analyticsConfig);
      expect(pageViewInitializerService.initialize).not.toHaveBeenCalled();
      expect(analyticsGaGtmColivingRewriteService.initGaGtmColiving).toHaveBeenCalledWith(false);
    });

    it('should not do anything when settings are null', () => {
      analyticsSettingsFacade.getAnalyticsSettings.and.returnValue(of(null));

      service.initializeAnalyticsSettings();

      expect(analyticsService.setConfig).not.toHaveBeenCalled();
      expect(pageViewInitializerService.initialize).not.toHaveBeenCalled();
      expect(analyticsGaGtmColivingRewriteService.initGaGtmColiving).not.toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should call both initializePointOfSales and initializeAnalyticsSettings', () => {
      spyOn(service, 'initializePointOfSales');
      spyOn(service, 'initializeAnalyticsSettings');

      service.initialize();

      expect(service.initializePointOfSales).toHaveBeenCalled();
      expect(service.initializeAnalyticsSettings).toHaveBeenCalled();
    });

    it('should set up keyboard focus detection on Tab keydown', () => {
      service.initialize();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

      expect(document.body.classList.contains('keyboard-focus-mode')).toBeTrue();
    });

    it('should keep keyboard focus mode after stationary pointer clicks (pending pointermove confirmation)', () => {
      service.initialize();

      // Enable via Tab
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.body.classList.contains('keyboard-focus-mode')).toBeTrue();

      // Stationary click — no pointermove — class stays (could be AT synthetic or clicking what was tabbed to)
      document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', buttons: 1, bubbles: true }));
      expect(document.body.classList.contains('keyboard-focus-mode')).toBeTrue();

      // Second stationary click — class still stays; only pointermove confirms a real interaction
      document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', buttons: 1, bubbles: true }));
      expect(document.body.classList.contains('keyboard-focus-mode')).toBeTrue();

      // Cursor movement confirms real mouse use — class removed
      document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
      expect(document.body.classList.contains('keyboard-focus-mode')).toBeFalse();
    });
  });
});
