import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardingPassEligibilityStatus, PaxSegmentInfo } from '@dcx/ui/api-layer';
import {
  ButtonStyles,
  DeviceInfoService,
  DeviceType,
  EnumStorageKey,
  LayoutSize,
  PaxSegmentCheckinStatus,
  StorageService
} from '@dcx/ui/libs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PaxCheckinService, SegmentCheckIn } from '../../../../../api-layer/src/lib/booking';
import { BoardingPassFormatType, CheckInCommonTranslationKeys } from '../../enums';
import {
  BOARDING_PASS_VM_BUILDER_SERVICE,
  DownloadBoardingPassRequest,
  DownloadBoardingPassService,
  IProcessBoardingPass,
  PROCESS_BOARDING_PASS_SERVICE,
} from '../../services';
import { CheckInSummaryPassengerVM } from '../check-in-summary';
import { CheckInPassengersListBaseComponent } from './check-in-passengers-list-base.component';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

/**
 * Concrete implementation for testing abstract component
 */
@Component({
  template: '',
  standalone: true,
})
class TestCheckInPassengersListComponent extends CheckInPassengersListBaseComponent {}

describe('CheckInPassengersListBaseComponent', () => {
  let component: TestCheckInPassengersListComponent;
  let fixture: ComponentFixture<TestCheckInPassengersListComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDeviceInfoService: jasmine.SpyObj<DeviceInfoService>;
  let mockDownloadBoardingPassService: jasmine.SpyObj<DownloadBoardingPassService>;
  let mockCheckInService: jasmine.SpyObj<PaxCheckinService>;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockBoardingPassVMBuilderService: any;
  let mockProcessBoardingPasses: IProcessBoardingPass[];

  const mockPassengers: CheckInSummaryPassengerVM[] = [
    {
      id: 'PAX1',
      name: 'John Doe',
      lifemilesNumber: '123456',
      referenceId: 'REF1',
      status: PaxSegmentCheckinStatus.CHECKED_IN,
      seats: ['2A', '3B'],
      segmentsInfo: [
        {
          segmentId: 'SEG1',
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          seat: '2A',
        } as any,
      ],
    },
    {
      id: 'PAX2',
      name: 'Jane Smith',
      lifemilesNumber: '789012',
      referenceId: 'REF2',
      status: PaxSegmentCheckinStatus.OVERBOOKED,
      seats: [],
      segmentsInfo: [
        {
          segmentId: 'SEG1',
          status: PaxSegmentCheckinStatus.OVERBOOKED,
          seat: '',
        } as any,
      ],
    },
  ];

  const mockSegmentsCheckInStatus: SegmentCheckIn[] = [
    {
      segmentId: 'SEG1',
      pax: [
        {
          paxId: 'PAX1',
          canDownloadBoardingPass: true,
        },
        {
          paxId: 'PAX2',
          canDownloadBoardingPass: false,
        },
      ],
    } as SegmentCheckIn,
  ];

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Translated Text');

    mockDeviceInfoService = jasmine.createSpyObj('DeviceInfoService', ['getDeviceType']);
    mockDeviceInfoService.getDeviceType.and.returnValue(DeviceType.PC);

    mockDownloadBoardingPassService = jasmine.createSpyObj('DownloadBoardingPassService', [
      'initProcessBoardingPasses',
      'downloadBoardingPassPdf',
    ]);

    mockCheckInService = jasmine.createSpyObj('PaxCheckinService', ['getCheckinStatus']);
    mockCheckInService.getCheckinStatus.and.returnValue(
      of({
        result: {
          data: mockSegmentsCheckInStatus,
        },
      } as any)
    );

    mockStorageService = jasmine.createSpyObj('StorageService', ['getSessionStorage']);
    mockStorageService.getSessionStorage.and.returnValue(false);

    mockBoardingPassVMBuilderService = jasmine.createSpyObj('BoardingPassVMBuilderService', ['getBoardingPassVM']);
    mockBoardingPassVMBuilderService.getBoardingPassVM.and.returnValue({
      paxId: 'PAX1',
    } as any);

    mockProcessBoardingPasses = [];

    await TestBed.configureTestingModule({
      imports: [
        TestCheckInPassengersListComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: DeviceInfoService, useValue: mockDeviceInfoService },
        { provide: DownloadBoardingPassService, useValue: mockDownloadBoardingPassService },
        { provide: PaxCheckinService, useValue: mockCheckInService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: BOARDING_PASS_VM_BUILDER_SERVICE, useValue: mockBoardingPassVMBuilderService },
        { provide: PROCESS_BOARDING_PASS_SERVICE, useValue: mockProcessBoardingPasses },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCheckInPassengersListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('passengers', mockPassengers);
    fixture.componentRef.setInput('journeyId', 'JOURNEY1');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call internalInit on initialization', () => {
      spyOn<any>(component, 'internalInit');

      component.ngOnInit();

      expect(component['internalInit']).toHaveBeenCalled();
    });
  });

  describe('internalInit', () => {
    it('should initialize component dependencies and state', () => {
      spyOn<any>(component, 'loadOcaEnabledFromSession');
      spyOn<any>(component, 'setIsMobile');
      spyOn<any>(component, 'setDownloadButtonConfig');
      spyOn<any>(component, 'setPassengerStatus');
      spyOn<any>(component, 'setPassengerSeatsDisplay');
      spyOn<any>(component, 'loadCheckInStatus');

      component['internalInit']();

      expect(mockDownloadBoardingPassService.initProcessBoardingPasses).toHaveBeenCalledWith(mockProcessBoardingPasses);
      expect(component['loadOcaEnabledFromSession']).toHaveBeenCalled();
      expect(component['setIsMobile']).toHaveBeenCalled();
      expect(component['setDownloadButtonConfig']).toHaveBeenCalled();
      expect(component['setPassengerStatus']).toHaveBeenCalled();
      expect(component['setPassengerSeatsDisplay']).toHaveBeenCalled();
      expect(component['loadCheckInStatus']).toHaveBeenCalled();
    });
  });

  describe('hasOverbookedSegment', () => {
    it('should return true when passenger has overbooked segment', () => {
      const result = component.hasOverbookedSegment(mockPassengers[1]);
      expect(result).toBe(true);
    });

    it('should return false when passenger does not have overbooked segment', () => {
      const result = component.hasOverbookedSegment(mockPassengers[0]);
      expect(result).toBe(false);
    });

    it('should filter by segmentId when provided', () => {
      const resultMatch = component.hasOverbookedSegment(mockPassengers[1], 'SEG1');
      expect(resultMatch).toBe(true);

      const resultNoMatch = component.hasOverbookedSegment(mockPassengers[1], 'SEG2');
      expect(resultNoMatch).toBe(false);
    });
  });

  describe('hasStandBySegment', () => {
    it('should return true when passenger has standby segment', () => {
      const passengerWithStandby: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.STAND_BY,
          } as any,
        ],
      };

      const result = component.hasStandBySegment(passengerWithStandby);
      expect(result).toBe(true);
    });

    it('should return false when passenger does not have standby segment', () => {
      const result = component.hasStandBySegment(mockPassengers[0]);
      expect(result).toBe(false);
    });

    it('should filter by segmentId when provided', () => {
      const passengerWithStandby: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.STAND_BY,
          } as any,
        ],
      };

      const resultMatch = component.hasStandBySegment(passengerWithStandby, 'SEG1');
      expect(resultMatch).toBe(true);

      const resultNoMatch = component.hasStandBySegment(passengerWithStandby, 'SEG2');
      expect(resultNoMatch).toBe(false);
    });
  });

  describe('shouldFollowOverbookingPath', () => {
    it('should return true when passenger has overbooked segment', () => {
      const result = component.shouldFollowOverbookingPath(mockPassengers[1]);
      expect(result).toBe(true);
    });

    it('should return true when OCA is disabled and passenger has standby segment', () => {
      component.isOcaEnabled = false;
      const passengerWithStandby: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.STAND_BY } as any],
      };

      const result = component.shouldFollowOverbookingPath(passengerWithStandby);
      expect(result).toBe(true);
    });

    it('should return false when OCA is enabled and passenger has standby segment', () => {
      component.isOcaEnabled = true;
      const passengerWithStandby: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.STAND_BY } as any],
      };

      const result = component.shouldFollowOverbookingPath(passengerWithStandby);
      expect(result).toBe(false);
    });

    it('should return false when passenger has no special status', () => {
      const result = component.shouldFollowOverbookingPath(mockPassengers[0]);
      expect(result).toBe(false);
    });
  });

  describe('onClickDownload', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should set showBoardingPassPreview to true and set boardingPassOffCanvasData when isMobile is true', () => {
      component.isMobile = true;
      component.showBoardingPassPreview.set(false);

      component.onClickDownload(mockPassengers[0]);

      expect(component.showBoardingPassPreview()).toBe(true);
      expect(component.boardingPassOffCanvasData()).toEqual({
        boardingPassVM: { paxId: 'PAX1' } as any,
      });
      expect(mockBoardingPassVMBuilderService.getBoardingPassVM).toHaveBeenCalledWith({
        paxId: 'PAX1',
        journeyId: 'JOURNEY1',
      });
    });

    it('should call downloadBoardingPassPdf when isMobile is false', () => {
      component.isMobile = false;
      spyOn<any>(component, 'downloadBoardingPassPdf');

      component.onClickDownload(mockPassengers[0]);

      expect(component.showBoardingPassPreview()).toBe(true);
      expect(component['downloadBoardingPassPdf']).toHaveBeenCalledWith(mockPassengers[0]);
    });
  });

  describe('onCloseOffCanvas', () => {
    it('should set showBoardingPassPreview to false', () => {
      component.showBoardingPassPreview.set(true);

      component.onCloseOffCanvas();

      expect(component.showBoardingPassPreview()).toBe(false);
    });
  });

  describe('canDownloadBoardingPass', () => {
    it('should return true when passenger can download and has at least one CHECKED_IN eligible segment', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        canDownloadBoardingPass: true,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
            },
          } as any,
        ],
      };

      const result = component.canDownloadBoardingPass(passenger);

      expect(result).toBe(true);
    });

    it('should return false when passenger cannot download even with eligible segments', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        canDownloadBoardingPass: false,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
            },
          } as any,
        ],
      };

      const result = component.canDownloadBoardingPass(passenger);

      expect(result).toBe(false);
    });

    it('should return false when eligible status exists only in non CHECKED_IN segments', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        canDownloadBoardingPass: true,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
            },
          } as PaxSegmentInfo,
          {
            segmentId: 'SEG2',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
            },
          } as PaxSegmentInfo,
        ],
      };

      const result = component.canDownloadBoardingPass(passenger);

      expect(result).toBe(false);
    });
  });

  describe('hasNonEligibleBoardingPass', () => {
    it('should return true when checked-in passenger has at least one non-eligible CHECKED_IN segment', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        status: PaxSegmentCheckinStatus.CHECKED_IN,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
            },
          } as PaxSegmentInfo,
        ],
      };

      const result = component.hasNonEligibleBoardingPass(passenger);

      expect(result).toBe(true);
    });

    it('should return false when passenger is not checked in', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
            },
          } as PaxSegmentInfo,
        ],
      };

      const result = component.hasNonEligibleBoardingPass(passenger);

      expect(result).toBe(false);
    });

    it('should return false when non-eligible status exists only in non CHECKED_IN segments', () => {
      const passenger: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        status: PaxSegmentCheckinStatus.CHECKED_IN,
        segmentsInfo: [
          {
            segmentId: 'SEG1',
            status: PaxSegmentCheckinStatus.CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.ELIGIBLE,
            },
          } as any,
          {
            segmentId: 'SEG2',
            status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
            boardingPassEligibility: {
              boardingPassEligibilityStatus: BoardingPassEligibilityStatus.INELIGIBLE,
            },
          } as any,
        ],
      };

      const result = component.hasNonEligibleBoardingPass(passenger);

      expect(result).toBe(false);
    });
  });

  describe('setDownloadButtonConfig', () => {
    it('should configure downloadButtonConfig with translated labels and correct layout', () => {
      component['setDownloadButtonConfig']();

      expect(component.downloadButtonConfig).toBeDefined();
      expect(component.downloadButtonConfig.label).toBe('Translated Text');
      expect(component.downloadButtonConfig.layout?.size).toBe(LayoutSize.SMALL);
      expect(component.downloadButtonConfig.layout?.style).toBe(ButtonStyles.SECONDARY);
      expect(mockTranslateService.instant).toHaveBeenCalledWith(CheckInCommonTranslationKeys.CheckIn_BoardingPass_Download_Button);
    });
  });

  describe('setPassengerStatus', () => {
    it('should set passengerStatus for all passengers in lowercase', () => {
      component['setPassengerStatus']();

      expect(component.passengerStatus['PAX1']).toBe('checkedin');
      expect(component.passengerStatus['PAX2']).toBe('overbooked');
    });
  });

  describe('downloadBoardingPassPdf', () => {
    it('should call downloadBoardingPassService with correct data', () => {
      const expectedData: DownloadBoardingPassRequest = {
        paxId: 'PAX1',
        journeyId: 'JOURNEY1',
        formatType: BoardingPassFormatType.PDF,
      };

      component['downloadBoardingPassPdf'](mockPassengers[0]);

      expect(mockDownloadBoardingPassService.downloadBoardingPassPdf).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('setPassengerSeatsDisplay', () => {
    it('should display seats correctly when passenger has seats', () => {
      component['setPassengerSeatsDisplay']();
      expect(component.passengerSeatsDisplay['PAX1']).toBe('2A, 3B');
    });

    it('should display "--" when passenger has no seats or special status', () => {
      component['setPassengerSeatsDisplay']();
      expect(component.passengerSeatsDisplay['PAX2']).toBe('--');
    });

    it('should display "--" for passengers with overbooked or standby status even if they have seats', () => {
      const passengers: CheckInSummaryPassengerVM[] = [
        {
          id: 'PAX3',
          name: 'Test User',
          lifemilesNumber: '111111',
          referenceId: 'REF3',
          status: PaxSegmentCheckinStatus.OVERBOOKED,
          seats: ['2A'],
          segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.OVERBOOKED } as any],
        },
        {
          id: 'PAX4',
          name: 'Test User',
          lifemilesNumber: '222222',
          referenceId: 'REF4',
          status: PaxSegmentCheckinStatus.STAND_BY,
          seats: ['2A'],
          segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.STAND_BY } as any],
        },
      ];
      fixture.componentRef.setInput('passengers', passengers);

      component['setPassengerSeatsDisplay']();

      expect(component.passengerSeatsDisplay['PAX3']).toBe('--');
      expect(component.passengerSeatsDisplay['PAX4']).toBe('--');
    });

    it('should replace empty seats with "-" while preserving position', () => {
      const passengers: CheckInSummaryPassengerVM[] = [
        {
          id: 'PAX5',
          name: 'Test User',
          lifemilesNumber: '333333',
          referenceId: 'REF5',
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          seats: ['2A', '', '3C'],
          segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.CHECKED_IN } as any],
        },
      ];
      fixture.componentRef.setInput('passengers', passengers);

      component['setPassengerSeatsDisplay']();

      expect(component.passengerSeatsDisplay['PAX5']).toBe('2A, -, 3C');
    });

    it('should handle edge cases: empty strings array and undefined seats', () => {
      const passengers: CheckInSummaryPassengerVM[] = [
        {
          id: 'PAX6',
          name: 'Test User',
          lifemilesNumber: '444444',
          referenceId: 'REF6',
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          seats: ['', ''],
          segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.CHECKED_IN } as any],
        },
        {
          id: 'PAX7',
          name: 'Test User 2',
          lifemilesNumber: '555555',
          referenceId: 'REF7',
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          seats: undefined,
          segmentsInfo: [{ segmentId: 'SEG1', status: PaxSegmentCheckinStatus.CHECKED_IN } as any],
        } as any,
      ];
      fixture.componentRef.setInput('passengers', passengers);

      component['setPassengerSeatsDisplay']();

      expect(component.passengerSeatsDisplay['PAX6']).toBe('--');
      expect(component.passengerSeatsDisplay['PAX7']).toBe('--');
    });
  });

  describe('setIsMobile', () => {
    it('should set isMobile to true when device is mobile', () => {
      mockDeviceInfoService.getDeviceType.and.returnValue(DeviceType.MOBILE);
      component['setIsMobile']();
      expect(component.isMobile).toBe(true);
    });

    it('should set isMobile to false when device is desktop or tablet', () => {
      mockDeviceInfoService.getDeviceType.and.returnValue(DeviceType.PC);
      component['setIsMobile']();
      expect(component.isMobile).toBe(false);

      mockDeviceInfoService.getDeviceType.and.returnValue(DeviceType.TABLET);
      component['setIsMobile']();
      expect(component.isMobile).toBe(false);
    });
  });

  describe('loadCheckInStatus', () => {
    it('should set segmentsCheckInStatus when service returns data', () => {
      component['loadCheckInStatus']();
      expect(component.segmentsCheckInStatus()).toEqual(mockSegmentsCheckInStatus);
    });

    it('should set empty array when service returns no data', () => {
      mockCheckInService.getCheckinStatus.and.returnValue(of({ result: { data: null } } as any));
      component['loadCheckInStatus']();
      expect(component.segmentsCheckInStatus()).toEqual([]);
    });

    it('should handle error from service', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const error = new Error('Test error');
      mockCheckInService.getCheckinStatus.and.returnValue(throwError(() => error));

      component['loadCheckInStatus']();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching the check-in status', error);
    });
  });

  describe('hasSegmentWithStatus', () => {
    it('should return true when passenger has segment with specified status', () => {
      const result = component['hasSegmentWithStatus'](mockPassengers[1], PaxSegmentCheckinStatus.OVERBOOKED);
      expect(result).toBe(true);
    });

    it('should return false when passenger does not have segment with specified status', () => {
      const result = component['hasSegmentWithStatus'](mockPassengers[0], PaxSegmentCheckinStatus.OVERBOOKED);
      expect(result).toBe(false);
    });

    it('should filter by segmentId when provided', () => {
      const resultMatch = component['hasSegmentWithStatus'](mockPassengers[1], PaxSegmentCheckinStatus.OVERBOOKED, 'SEG1');
      expect(resultMatch).toBe(true);

      const resultNoMatch = component['hasSegmentWithStatus'](mockPassengers[1], PaxSegmentCheckinStatus.OVERBOOKED, 'SEG2');
      expect(resultNoMatch).toBe(false);
    });

    it('should return false when segmentsInfo is undefined', () => {
      const passengerWithoutSegments: CheckInSummaryPassengerVM = {
        ...mockPassengers[0],
        segmentsInfo: undefined,
      };

      const result = component['hasSegmentWithStatus'](passengerWithoutSegments, PaxSegmentCheckinStatus.CHECKED_IN);
      expect(result).toBe(false);
    });
  });

  describe('loadOcaEnabledFromSession', () => {
    it('should set isOcaEnabled based on session storage value', () => {
      mockStorageService.getSessionStorage.and.returnValue(true);
      component['loadOcaEnabledFromSession']();
      expect(component.isOcaEnabled).toBe(true);

      mockStorageService.getSessionStorage.and.returnValue(false);
      component['loadOcaEnabledFromSession']();
      expect(component.isOcaEnabled).toBe(false);

      mockStorageService.getSessionStorage.and.returnValue(null);
      component['loadOcaEnabledFromSession']();
      expect(component.isOcaEnabled).toBe(false);
    });

    it('should call getSessionStorage with correct key', () => {
      component['loadOcaEnabledFromSession']();
      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.IsOcaEnabled);
    });
  });
});
