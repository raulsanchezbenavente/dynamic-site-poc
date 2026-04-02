import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';
import { BookingClient } from '@dcx/module/api-clients';
import { DeviceInfoService, EXCLUDE_SESSION_EXPIRED_URLS, KeyCodeEnum, OperatingSystemType, PaxSegmentCheckinStatus, TIMEOUT_REDIRECT } from '@dcx/ui/libs';
import { BoardingPassPreviewComponent } from './boarding-pass-preview.component';
import { BoardingPassVM } from './models/boarding-pass-vm.model';
import { DownloadBoardingPassService, SessionService, TrackAnalyticsErrorService } from '../../../services';
import { BoardingPassFormatType } from '../../../enums';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AnalyticsService } from '@dcx/module/analytics';

class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('BoardingPassPreviewComponent', () => {
  let component: BoardingPassPreviewComponent;
  let fixture: ComponentFixture<BoardingPassPreviewComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDownloadBoardingPassService: jasmine.SpyObj<DownloadBoardingPassService>;
  let mockBookingClient: jasmine.SpyObj<BookingClient>;
  let mockDeviceInfoService: jasmine.SpyObj<DeviceInfoService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;
  let mockTrackAnalyticsErrorService: jasmine.SpyObj<TrackAnalyticsErrorService>;

  const mockBoardingPassData: BoardingPassVM = {
    passengerName: 'John Doe',
    paxId: 'PAX123',
    segments: [
      {
        id: 'seg1',
        journeyId: 'journey1',
        origin: 'Bogotá',
        destination: 'Miami',
        originCode: 'BOG',
        destinationCode: 'MIA',
        departureTime: '10:30',
        departureDate: {
          date: new Date('2025-12-15'),
          format: 'dd/MM/yyyy',
        },
        gate: 'A12',
        seat: '12A',
        flightNumber: 'AV123',
      },
      {
        id: 'seg2',
        journeyId: 'journey1',
        origin: 'Miami',
        destination: 'New York',
        originCode: 'MIA',
        destinationCode: 'JFK',
        departureTime: '14:30',
        departureDate: {
          date: new Date('2025-12-15'),
          format: 'dd/MM/yyyy',
        },
        gate: 'B5',
        seat: '15C',
        flightNumber: 'AV456',
      },
    ],
  };

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockTranslateService.instant.and.returnValue('Download PDF');
    mockTranslateService.get.and.returnValue(of('Translation'));

    mockDownloadBoardingPassService = jasmine.createSpyObj('DownloadBoardingPassService', [
      'downloadBoardingPassPdf',
      'initProcessBoardingPasses',
      'initBoardingPassesForAllSegments',
      'processBoardingPassForSegment',
    ]);

    mockBookingClient = jasmine.createSpyObj('BookingClient', ['generate']);
    mockDeviceInfoService = jasmine.createSpyObj('DeviceInfoService', ['getOS']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['getBookingFromStorage']);
    mockAnalyticsService = jasmine.createSpyObj('AnalyticsService', ['trackEvent', 'trackPageView']);
    mockTrackAnalyticsErrorService = jasmine.createSpyObj('TrackAnalyticsErrorService', ['trackAnalyticsError']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BoardingPassPreviewComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: DownloadBoardingPassService, useValue: mockDownloadBoardingPassService },
        { provide: DeviceInfoService, useValue: mockDeviceInfoService },
        {
          provide: BookingClient,
          useValue: mockBookingClient,
        },
        {
          provide: CookieService,
          useValue: jasmine.createSpyObj('CookieService', ['get', 'put', 'remove']),
        },
        { provide: SessionService, useValue: mockSessionService },
        { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: [] },
        { provide: TIMEOUT_REDIRECT, useValue: '/timeout' },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: TrackAnalyticsErrorService, useValue: mockTrackAnalyticsErrorService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardingPassPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockBoardingPassData);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSegmentTabClick', () => {
    it('should update selectedSegmentIndex when called', () => {
      component['onSegmentTabClick'](1);

      expect(component['selectedSegmentIndex']()).toBe(1);
    });

    it('should set selectedSegmentIndex to 0 when first tab is clicked', () => {
      component['selectedSegmentIndex'].set(1);

      component['onSegmentTabClick'](0);

      expect(component['selectedSegmentIndex']()).toBe(0);
    });

    it('should update activeSegment when selectedSegmentIndex changes', () => {
      component['onSegmentTabClick'](1);

      expect(component['activeSegment']().id).toBe('seg2');
    });
  });

  describe('onTabKeydown', () => {
    beforeEach(() => {
      spyOn(document, 'getElementById').and.returnValue({
        focus: jasmine.createSpy('focus'),
      } as any);
    });

    it('should move to previous segment on ArrowLeft key', () => {
      component['selectedSegmentIndex'].set(1);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_LEFT });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 1);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(0);
    });

    it('should wrap to last segment on ArrowLeft from first segment', () => {
      component['selectedSegmentIndex'].set(0);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_LEFT });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(1);
    });

    it('should move to next segment on ArrowRight key', () => {
      component['selectedSegmentIndex'].set(0);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_RIGHT });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(1);
    });

    it('should wrap to first segment on ArrowRight from last segment', () => {
      component['selectedSegmentIndex'].set(1);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_RIGHT });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 1);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(0);
    });

    it('should move to first segment on Home key', () => {
      component['selectedSegmentIndex'].set(1);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.HOME });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 1);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(0);
    });

    it('should move to last segment on End key', () => {
      component['selectedSegmentIndex'].set(0);
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.END });
      spyOn(event, 'preventDefault');

      component['onTabKeydown'](event, 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component['selectedSegmentIndex']()).toBe(1);
    });

    it('should not change segment on other keys', () => {
      component['selectedSegmentIndex'].set(0);
      const event = new KeyboardEvent('keydown', { key: 'a' });

      component['onTabKeydown'](event, 0);

      expect(component['selectedSegmentIndex']()).toBe(0);
    });

    it('should focus the new tab element', () => {
      const event = new KeyboardEvent('keydown', { key: KeyCodeEnum.ARROW_RIGHT });
      const mockElement = { focus: jasmine.createSpy('focus') };
      (document.getElementById as jasmine.Spy).and.returnValue(mockElement);

      component['onTabKeydown'](event, 0);

      expect(document.getElementById).toHaveBeenCalledWith('segment-tab-1');
      expect(mockElement.focus).toHaveBeenCalled();
    });
  });

  describe('getTabId', () => {
    it('should return correct tab id for index 0', () => {
      const tabId = component['getTabId'](0);

      expect(tabId).toBe('segment-tab-0');
    });

    it('should return correct tab id for index 1', () => {
      const tabId = component['getTabId'](1);

      expect(tabId).toBe('segment-tab-1');
    });
  });

  describe('getTabPanelId', () => {
    it('should return correct tabpanel id for index 0', () => {
      const panelId = component['getTabPanelId'](0);

      expect(panelId).toBe('segment-panel-0');
    });

    it('should return correct tabpanel id for index 1', () => {
      const panelId = component['getTabPanelId'](1);

      expect(panelId).toBe('segment-panel-1');
    });
  });

  describe('getDeviceWalletFormatType', () => {
    it('should return GOOGLE_PAY for Android devices', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.ANDROID);

      const formatType = component['getDeviceWalletFormatType']();

      expect(formatType).toBe(BoardingPassFormatType.GOOGLE_PAY);
    });

    it('should return APPLE_WALLET for iOS devices', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.IOS);

      const formatType = component['getDeviceWalletFormatType']();

      expect(formatType).toBe(BoardingPassFormatType.APPLE_WALLET);
    });

    it('should return null for other operating systems', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.WINDOWS);

      const formatType = component['getDeviceWalletFormatType']();

      expect(formatType).toBeNull();
    });

    it('should return null for unknown operating systems', () => {
      mockDeviceInfoService.getOS.and.returnValue('Unknown' as OperatingSystemType);

      const formatType = component['getDeviceWalletFormatType']();

      expect(formatType).toBeNull();
    });
  });

  describe('setAddWalletButtonConfig', () => {
    it('should set addWalletButtonConfig when format type is supported', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.IOS);

      component['setAddWalletButtonConfig']();

      expect(component.addWalletButtonConfig).toEqual({
        formatType: BoardingPassFormatType.APPLE_WALLET,
      });
    });

    it('should set addWalletButtonConfig to undefined when format type is not supported', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.WINDOWS);

      component['setAddWalletButtonConfig']();

      expect(component.addWalletButtonConfig).toBeUndefined();
    });

    it('should set GOOGLE_PAY config for Android', () => {
      mockDeviceInfoService.getOS.and.returnValue(OperatingSystemType.ANDROID);

      component['setAddWalletButtonConfig']();

      expect(component.addWalletButtonConfig).toEqual({
        formatType: BoardingPassFormatType.GOOGLE_PAY,
      });
    });
  });

  describe('isPaxInStandByForActiveSegment', () => {
    it('should return false when booking is not available in storage', () => {
      mockSessionService.getBookingFromStorage.and.returnValue(null);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
      expect(mockSessionService.getBookingFromStorage).toHaveBeenCalled();
    });

    it('should return false when passenger is not found in booking', () => {
      const mockBooking = {
        pax: [
          {
            id: 'DIFFERENT_PAX_ID',
            segmentsInfo: [],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });

    it('should return false when segment is not found in passenger segmentsInfo', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'different-segment-id',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });

    it('should return true when passenger has STAND_BY status for active segment', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'seg1',
                status: PaxSegmentCheckinStatus.STAND_BY,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(true);
    });

    it('should return false when passenger has CHECKED_IN status for active segment', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'seg1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });

    it('should return false when passenger has NOT_CHECKED_IN status for active segment', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'seg1',
                status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });

    it('should handle case-insensitive comparison for STAND_BY status', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'seg1',
                status: 'standby' as PaxSegmentCheckinStatus,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(true);
    });

    it('should react to active segment changes when switching tabs', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: [
              {
                segmentId: 'seg1',
                status: PaxSegmentCheckinStatus.STAND_BY,
              },
              {
                segmentId: 'seg2',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      expect(component['isPaxInStandByForActiveSegment']()).toBe(true);

      component['onSegmentTabClick'](1);

      expect(component['isPaxInStandByForActiveSegment']()).toBe(false);
    });

    it('should return false when segmentsInfo is undefined', () => {
      const mockBooking = {
        pax: [
          {
            id: 'PAX123',
            segmentsInfo: undefined,
          },
        ],
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });

    it('should return false when pax array is undefined', () => {
      const mockBooking = {
        pax: undefined,
      };
      mockSessionService.getBookingFromStorage.and.returnValue(mockBooking as any);

      const result = component['isPaxInStandByForActiveSegment']();

      expect(result).toBe(false);
    });
  });
});
