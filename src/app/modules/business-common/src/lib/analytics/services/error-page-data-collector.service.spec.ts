import { TestBed } from '@angular/core/testing';
import { StorageService } from '@dcx/ui/libs';

import { AnalyticsDataType, AnalyticsUserType } from '../../enums';
import { ErrorPageDataCollector } from './error-page-data-collector.service';
import { PageViewDataCollector } from './page-view-data-collector.service';

describe('ErrorPageDataCollector', () => {
  let service: ErrorPageDataCollector;
  let mockPageViewCollector: jasmine.SpyObj<PageViewDataCollector>;
  let mockStorageService: jasmine.SpyObj<StorageService>;

  const mockPageViewData = {
    page_location: 'https://localhost:44382/check-in/login',
    page_referrer: 'https://localhost:44382/home',
    page_title: 'Check In Login',
    language: 'es-ES',
    screen_resolution: '1920x1080',
    user_type: 'Guest',
    page_name: 'check-in-login',
  };

  beforeEach(() => {
    mockPageViewCollector = jasmine.createSpyObj('PageViewDataCollector', ['collectPageViewData']);
    mockStorageService = jasmine.createSpyObj('StorageService', ['getSessionStorage']);

    mockPageViewCollector.collectPageViewData.and.returnValue(mockPageViewData as any);

    mockStorageService.getSessionStorage.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        ErrorPageDataCollector,
        { provide: PageViewDataCollector, useValue: mockPageViewCollector },
        { provide: StorageService, useValue: mockStorageService },
      ],
    });

    service = TestBed.inject(ErrorPageDataCollector);
  });

  afterEach(() => {
    mockPageViewCollector.collectPageViewData.calls.reset();
    mockStorageService.getSessionStorage.calls.reset();
  });

  describe('collect', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should collect basic error data with provided error id and description', () => {
      const result = service.collect('500', 'Internal Server Error');

      expect(result).toEqual({
        event_category: jasmine.any(String),
        page_location: mockPageViewData.page_location,
        page_referrer: mockPageViewData.page_referrer,
        page_title: mockPageViewData.page_title,
        language: mockPageViewData.language,
        screen_resolution: mockPageViewData.screen_resolution,
        user_type: AnalyticsUserType.GUEST,
        user_id: AnalyticsDataType.NA,
        page_name: 'login',
        error_pnr: AnalyticsDataType.NA,
        error_id: '500',
        error_desc: 'Internal Server Error',
      });
    });

    it('should use provided errorPnr when passed as parameter', () => {
      const result = service.collect('404', 'Not Found', 'ABC123');

      expect(result.error_pnr).toBe('ABC123');
    });

    it('should get PNR from session when not provided', () => {
      const mockBookingSession = {
        bookingInfo: {
          recordLocator: 'XYZ789',
        },
      };

      mockStorageService.getSessionStorage.and.returnValue(mockBookingSession);

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe('XYZ789');
      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith('sessionBooking');
    });

    it('should use NA when PNR is not in session and not provided', () => {
      mockStorageService.getSessionStorage.and.returnValue(null);

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe(AnalyticsDataType.NA);
    });

    it('should call pageViewCollector.collectPageViewData', () => {
      service.collect('404', 'Not Found');

      expect(mockPageViewCollector.collectPageViewData).toHaveBeenCalled();
    });
  });

  describe('collectGlobalError', () => {
    it('should collect error with 404 code and description', () => {
      const result = service.collectGlobalError();

      expect(result.error_id).toBe('404');
      expect(result.error_desc).toBe('404 error');
    });
  });

  describe('getPnrFromSession', () => {
    it('should return PNR from booking session', () => {
      const mockBookingSession = {
        bookingInfo: {
          recordLocator: 'TEST123',
        },
      };

      mockStorageService.getSessionStorage.and.returnValue(mockBookingSession);

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe('TEST123');
    });

    it('should return NA when booking session is null', () => {
      mockStorageService.getSessionStorage.and.returnValue(null);

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe(AnalyticsDataType.NA);
    });

    it('should return NA when bookingInfo is missing', () => {
      mockStorageService.getSessionStorage.and.returnValue({});

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe(AnalyticsDataType.NA);
    });

    it('should return NA when recordLocator is missing', () => {
         const mockBookingSession = {
          bookingInfo: {} as any,
     }

      mockStorageService.getSessionStorage.and.returnValue(mockBookingSession);

      const result = service.collect('404', 'Not Found');

      expect(result.error_pnr).toBe(AnalyticsDataType.NA);
    });
  });

  describe('getFunnelCategory', () => {
    it('should keep UMBRACO category even when sessionFlowType is present', () => {
         const mockBookingSession = {
          bookingInfo: {
            sessionFlowType: 0,
          } as any,
     }

      mockStorageService.getSessionStorage.and.returnValue(mockBookingSession);

      const result = service.collect('404', 'Not Found');

      expect(result.event_category).toBe('umbraco');
    });

    it('should keep UMBRACO category when sessionFlowType is 0 (falsy)', () => {
      const mockBookingSession = {
          bookingInfo: {
            sessionFlowType: 0,
          } as any,
     } 


      mockStorageService.getSessionStorage.and.returnValue(mockBookingSession);

      const result = service.collect('404', 'Not Found');

      expect(result.event_category).toBe('umbraco');
    });

  });

});
