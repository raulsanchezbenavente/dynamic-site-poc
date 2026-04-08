import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, Observable } from 'rxjs';
import { BookingClient } from '@dcx/module/api-clients';
import { CookieService } from 'ngx-cookie';

import { CheckInSummaryItemComponent } from './check-in-summary-item.component';
import { PaxCheckinService, PaxSegmentCheckinStatus } from '@dcx/ui/api-layer';
import { GenerateIdPipe, JourneyStatus, TimeMeasureModel, EXCLUDE_SESSION_EXPIRED_URLS, TIMEOUT_REDIRECT, StorageService } from '@dcx/ui/libs';
import {
  PanelAppearance,
  AlertPanelType,
} from '@dcx/ui/design-system';
import { RfCheckboxComponent } from 'reactive-forms';
import { ANALYTICS_INTERFACES_PROPERTIES, AnalyticsBusiness, AnalyticsEventType, CheckInCommonTranslationKeys, CheckInSummaryItemConfig, CheckInSummaryJourneyVM, CheckInSummaryPassengerVM, TrackAnalyticsErrorService } from '@dcx/ui/business-common';
import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '@dcx/module/analytics';
import { TranslationKeys } from '../../enums/translations-keys.enum';

// Custom TranslateLoader for testing
class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      [TranslationKeys.CheckIn_CheckInNotAvailable]: 'Check-in not available',
      [TranslationKeys.CheckIn_AirportCounter_SeatAvailability_Alert]: 'Some passengers must check-in at airport counter',
      [CheckInCommonTranslationKeys.CheckIn_Alert_Oca_Title]: 'On Call Availability',
      [CheckInCommonTranslationKeys.CheckIn_Alert_Overbooking_Title]: 'Overbooking Alert',
      [CheckInCommonTranslationKeys.CheckIn_Alert_Oca_Description]: 'Your seat is subject to availability',
    });
  }
}

describe('CheckInSummaryItemComponent', () => {
  let component: CheckInSummaryItemComponent;
  let fixture: ComponentFixture<CheckInSummaryItemComponent>;

  // Mock data
  const mockConfig: CheckInSummaryItemConfig = {
    showRemainingTime: true,
  };

  const mockRemainingTime: TimeMeasureModel = {
    days: 0,
    hours: 3,
    minutes: 30,
    seconds: 0,
  };

  const mockPassengers: CheckInSummaryPassengerVM[] = [
    {
      id: 'PAX-001',
      name: 'John Doe',
      detail: 'With infant Laura Doe',
      lifemilesNumber: 'LM123456',
      seats: ['12A', '13B'],
      status: PaxSegmentCheckinStatus.ALLOWED,
      referenceId: 'REF-001',
    },
    {
      id: 'PAX-002',
      name: 'Jane Smith',
      detail: '',
      lifemilesNumber: 'LM789012',
      seats: ['12B'],
      status: PaxSegmentCheckinStatus.ALLOWED,
      referenceId: 'REF-002',
    },
    {
      id: 'PAX-003',
      name: 'Bob Johnson',
      detail: '',
      lifemilesNumber: 'LM345678',
      seats: ['12C'],
      status: PaxSegmentCheckinStatus.NOT_ALLOWED,
      referenceId: 'REF-003',
    },
  ];

  const mockJourneyData: CheckInSummaryJourneyVM = {
    id: 'journey-1',
    origin: {
      city: 'Bogotá',
      iata: 'BOG',
      terminal: '1',
      airportName: 'El Dorado International Airport',
      country: 'Colombia',
    },
    destination: {
      city: 'Miami',
      iata: 'MIA',
      terminal: 'North',
      airportName: 'Miami International Airport',
      country: 'United States',
    },
    schedule: {
      std: new Date('2025-10-20T10:00:00'),
      sta: new Date('2025-10-20T15:00:00'),
      stdutc: new Date('2025-10-20T15:00:00Z'),
      stautc: new Date('2025-10-20T20:00:00Z'),
    },
    duration: '05:00',
    segments: [
      {
        id: 'segment-1',
        origin: {
          city: 'Bogotá',
          iata: 'BOG',
          terminal: '1',
          airportName: 'El Dorado International Airport',
          country: 'Colombia',
        },
        destination: {
          city: 'Miami',
          iata: 'MIA',
          terminal: 'North',
          airportName: 'Miami International Airport',
          country: 'United States',
        },
        schedule: {
          std: new Date('2025-10-20T10:00:00'),
          sta: new Date('2025-10-20T15:00:00'),
          stdutc: new Date('2025-10-20T15:00:00Z'),
          stautc: new Date('2025-10-20T20:00:00Z'),
        },
        duration: '05:00',
        legs: [],
        transport: {
          number: '1234',
          carrier: {
            code: 'AV',
            name: 'Avianca',
          },
        },
      },
    ],
    isCheckInAvailable: true,
    status: JourneyStatus.CONFIRMED,
    passengers: mockPassengers,
    remainingTimeToCheckIn: mockRemainingTime,
  };

  const mockJourneyDataNotAvailable: CheckInSummaryJourneyVM = {
    ...mockJourneyData,
    id: 'journey-2',
    isCheckInAvailable: false,
    passengers: [
      {
        id: 'PAX-004',
        name: 'Alice Brown',
        detail: '',
        lifemilesNumber: 'LM111111',
        seats: [],
        status: PaxSegmentCheckinStatus.NOT_ALLOWED,
        referenceId: 'REF-004',
      },
    ],
  };

  // Mock services
  let translateService: TranslateService;
  let generateIdPipeMock: Partial<GenerateIdPipe>;
  let titleCasePipeMock: Partial<TitleCasePipe>;
  let mockStorageService: jasmine.SpyObj<StorageService>;

  beforeEach(fakeAsync(() => {
    // Create pipe mocks
    const generateIdTransformSpy = jasmine.createSpy('generateIdTransform').and.callFake(
      (prefix: string) => prefix + '-generated-id'
    );
    generateIdPipeMock = { transform: generateIdTransformSpy };

    const titleCaseTransformSpy = jasmine.createSpy('titleCaseTransform').and.callFake(
      (value: string) => value
    );
    titleCasePipeMock = { transform: titleCaseTransformSpy };

    mockStorageService = jasmine.createSpyObj('StorageService', ['getSessionStorage', 'setSessionStorage']);
    mockStorageService.getSessionStorage.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        }),
        CheckInSummaryItemComponent
      ],
      providers: [
        { provide: GenerateIdPipe, useValue: generateIdPipeMock },
        { provide: TitleCasePipe, useValue: titleCasePipeMock },
        {
          provide: BookingClient,
          useValue: jasmine.createSpyObj('BookingClient', ['generate'])
        },
        {
          provide: CookieService,
          useValue: jasmine.createSpyObj('CookieService', ['get', 'put', 'remove'])
        },
        {
          provide: PaxCheckinService,
          useValue: jasmine.createSpyObj('PaxCheckinService', ['getCheckinStatus'], {
            getCheckinStatus: jasmine.createSpy('getCheckinStatus').and.returnValue(of({ data: [] }))
          })
        },
        { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: [] },
        { provide: TIMEOUT_REDIRECT, useValue: '/timeout' },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ANALYTICS_EXPECTED_KEYS_MAP, useValue: ANALYTICS_INTERFACES_PROPERTIES },
        { provide: ANALYTICS_EXPECTED_EVENTS, useValue: AnalyticsEventType },
        { provide: ANALYTICS_DICTIONARIES, useValue: AnalyticsBusiness },
        {
          provide: TrackAnalyticsErrorService,
          useValue: jasmine.createSpyObj('TrackAnalyticsErrorService', ['trackAnalyticsError']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use('en');

    fixture = TestBed.createComponent(CheckInSummaryItemComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('data', mockJourneyData);

    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required inputs defined', () => {
    expect(component.config()).toEqual(mockConfig);
    expect(component.data()).toEqual(mockJourneyData);
  });

  it('should initialize with default values', () => {
    expect(component.selectAllChecked).toBe(false);
    expect(component.passengersCheckboxModel).toEqual([]);
    expect(component.passengersFields).toEqual([]);
  });

  describe('ngOnInit', () => {
    it('should call internalInit on initialization', fakeAsync(() => {
      spyOn(component as any, 'internalInit').and.callThrough();

      component.ngOnInit();
      tick();

      expect((component as any).internalInit).toHaveBeenCalled();
    }));

    it('should set isCheckInAvailable to true when check-in is available', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.isCheckInAvailable).toBe(true);
    }));

    it('should set isCheckInAvailable to false when check-in is not available', fakeAsync(() => {
      fixture.componentRef.setInput('data', mockJourneyDataNotAvailable);
      tick();

      component.ngOnInit();
      tick();

      expect(component.isCheckInAvailable).toBe(false);
    }));

    it('should set journeyDataConfig with journey data', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.journeyDataConfig).toBeDefined();
      expect(component.journeyDataConfig.id).toBe(mockJourneyData.id);
    }));

    it('should set scheduleConfig with correct carrier display mode', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.scheduleConfig).toBeDefined();
      expect(component.scheduleConfig.scheduleConfig).toBeDefined();
    }));

    it('should set remainingTimeConfig with correct dictionary keys', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.remainingTimeConfig).toBeDefined();
      expect(component.remainingTimeConfig.labelDictionaryKey).toBe('CheckIn');
    }));

    it('should populate passengersCheckboxModel with allowed passengers only', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.passengersCheckboxModel.length).toBe(2);
      expect(component.passengersCheckboxModel[0].id).toBe('PAX-001');
      expect(component.passengersCheckboxModel[0].label).toBe('John Doe');
      expect(component.passengersCheckboxModel[1].id).toBe('PAX-002');
    }));

    it('should populate passengersFields array correctly', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.passengersFields.length).toBe(2);
      expect(component.passengersFields[0].id).toBe('PAX-001');
      expect(component.passengersFields[0].label).toBe('John Doe');
      expect(component.passengersFields[0].value).toBe(false);
    }));

    it('should set alertPanelConfig for NOT_ALLOWED passengers', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig).toBeDefined();
      expect(component.alertPanelConfig.alertType).toBe(AlertPanelType.WARNING);
      expect(component.alertPanelConfig.title).toBe('Some passengers must check-in at airport counter');
    }));

    it('should set alertPanelConfig with NEUTRAL type when check-in is not available and no remaining time', fakeAsync(() => {
      const dataWithoutTime: CheckInSummaryJourneyVM = {
        ...mockJourneyDataNotAvailable,
        remainingTimeToCheckIn: undefined,
      };
      fixture.componentRef.setInput('data', dataWithoutTime);
      tick();

      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig).toBeDefined();
      expect(component.alertPanelConfig.alertType).toBe(AlertPanelType.NEUTRAL);
      expect(component.alertPanelConfig.title).toBe('Check-in not available');
    }));
  });

  describe('handleCheckInAvailable', () => {
    it('should filter and set showCheckBoxElements with ALLOWED passengers', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.showCheckBoxElements().length).toBe(2);
      expect(component.showCheckBoxElements()[0].status).toBe(PaxSegmentCheckinStatus.ALLOWED);
      expect(component.showCheckBoxElements()[1].status).toBe(PaxSegmentCheckinStatus.ALLOWED);
    }));

    it('should set summaryItemPanelConfig with SHADOW appearance when check-in is available', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.summaryItemPanelConfig().appearance).toBe(PanelAppearance.SHADOW);
    }));

    it('should set summaryItemPanelConfig with BORDER appearance when check-in is not available', fakeAsync(() => {
      fixture.componentRef.setInput('data', mockJourneyDataNotAvailable);
      tick();

      component.ngOnInit();
      tick();

      expect(component.summaryItemPanelConfig().appearance).toBe(PanelAppearance.BORDER);
    }));
  });

  describe('shouldShowSelectAllCheckbox', () => {
    it('should return true when total passengers >= 2 and available passengers >= 1', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const result = component.shouldShowSelectAllCheckbox();

      expect(result).toBe(true);
    }));

    it('should return false when total passengers < 2', fakeAsync(() => {
      const dataSinglePassenger: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [mockPassengers[0]],
      };
      fixture.componentRef.setInput('data', dataSinglePassenger);
      tick();

      component.ngOnInit();
      tick();

      const result = component.shouldShowSelectAllCheckbox();

      expect(result).toBe(false);
    }));

    it('should return false when available passengers < 1', fakeAsync(() => {
      const dataNoAllowedPassengers: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.CHECKED_IN },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.NOT_ALLOWED },
        ],
      };
      fixture.componentRef.setInput('data', dataNoAllowedPassengers);
      tick();

      component.ngOnInit();
      tick();

      const result = component.shouldShowSelectAllCheckbox();

      expect(result).toBe(false);
    }));

    it('should return true when exactly 2 passengers with 1 available', fakeAsync(() => {
      const dataTwoPassengersOneAllowed: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          mockPassengers[0],
          { ...mockPassengers[2], status: PaxSegmentCheckinStatus.CHECKED_IN },
        ],
      };
      fixture.componentRef.setInput('data', dataTwoPassengersOneAllowed);
      tick();

      component.ngOnInit();
      tick();

      const result = component.shouldShowSelectAllCheckbox();

      expect(result).toBe(true);
    }));
  });

  describe('onSelectAllPassengersChanged', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should set selectAllChecked to true when event is true', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.selectAllChecked).toBe(true);
    }));

    it('should set selectAllChecked to false when event is false', fakeAsync(() => {
      component.onSelectAllPassengersChanged(false);
      tick();

      expect(component.selectAllChecked).toBe(false);
    }));

    it('should set showAlertMessage to true immediately', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);

      expect(component.showAlertMessage()).toBe(true);
    }));

    it('should reset showAlertMessage to false after 1000ms', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);
      expect(component.showAlertMessage()).toBe(true);

      tick(1000);

      expect(component.showAlertMessage()).toBe(false);
    }));

    it('should update passengersFields with checked values when event is true', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.passengersFields.length).toBe(2);
      expect(component.passengersFields[0].value).toBe('PAX-001 journey-1');
      expect(component.passengersFields[1].value).toBe('PAX-002 journey-1');
    }));

    it('should update passengersFields with empty values when event is false', fakeAsync(() => {
      component.onSelectAllPassengersChanged(false);
      tick();

      expect(component.passengersFields.length).toBe(2);
      expect(component.passengersFields[0].value).toBe('');
      expect(component.passengersFields[1].value).toBe('');
    }));

    it('should maintain passenger labels when toggling select all', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.passengersFields[0].label).toBe('John Doe');
      expect(component.passengersFields[1].label).toBe('Jane Smith');
    }));

    it('should maintain passenger IDs structure in passengersFields', fakeAsync(() => {
      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.passengersFields[0].id).toBe('PAX-001 journey-1');
      expect(component.passengersFields[1].id).toBe('PAX-002 journey-1');
    }));
  });

  describe('onChangeCheckBoxStatus', () => {
    let mockCheckboxComponent1: jasmine.SpyObj<RfCheckboxComponent>;
    let mockCheckboxComponent2: jasmine.SpyObj<RfCheckboxComponent>;

    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Create mock checkbox components
      mockCheckboxComponent1 = jasmine.createSpyObj('RfCheckboxComponent', ['getFormControl']);
      mockCheckboxComponent2 = jasmine.createSpyObj('RfCheckboxComponent', ['getFormControl']);

      mockCheckboxComponent1.autoId = 'RfCheckbox__test-value-1';
      mockCheckboxComponent2.autoId = 'RfCheckbox__test-value-2';

      const mockFormControl1 = jasmine.createSpyObj('FormControl', ['setValue']);
      const mockFormControl2 = jasmine.createSpyObj('FormControl', ['setValue']);

      mockCheckboxComponent1.getFormControl.and.returnValue(mockFormControl1);
      mockCheckboxComponent2.getFormControl.and.returnValue(mockFormControl2);

      // Mock passengerListElement
      Object.defineProperty(component, 'passengerListElement', {
        value: jasmine.createSpy().and.returnValue([mockCheckboxComponent1, mockCheckboxComponent2]),
        writable: true,
      });
    }));

    it('should set checkbox value when changeValue is true', fakeAsync(() => {
      const valueEvent = { changeValue: true, value: 'test-value-1' };

      component.onChangeCheckBoxStatus(valueEvent);
      tick();

      expect(mockCheckboxComponent1.getFormControl).toHaveBeenCalled();
      expect(mockCheckboxComponent1.getFormControl()?.setValue).toHaveBeenCalledWith(['test-value-1']);
    }));

    it('should clear checkbox value when changeValue is false', fakeAsync(() => {
      const valueEvent = { changeValue: false, value: 'test-value-1' };

      component.onChangeCheckBoxStatus(valueEvent);
      tick();

      expect(mockCheckboxComponent1.getFormControl).toHaveBeenCalled();
      expect(mockCheckboxComponent1.getFormControl()?.setValue).toHaveBeenCalledWith([]);
    }));

    it('should only update the matching checkbox by autoId', fakeAsync(() => {
      const valueEvent = { changeValue: true, value: 'test-value-2' };

      component.onChangeCheckBoxStatus(valueEvent);
      tick();

      expect(mockCheckboxComponent2.getFormControl).toHaveBeenCalled();
      expect(mockCheckboxComponent1.getFormControl).not.toHaveBeenCalled();
    }));

    it('should return early after finding matching checkbox', fakeAsync(() => {
      const valueEvent = { changeValue: true, value: 'test-value-1' };

      component.onChangeCheckBoxStatus(valueEvent);
      tick();

      expect(mockCheckboxComponent1.getFormControl()?.setValue).toHaveBeenCalledTimes(1);
    }));
  });

  describe('onCheckedPassengers', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should emit empty object when values array is empty', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers([]);
      tick();

      expect(emittedValue).toEqual({ 'journey-1': [] });
    }));

    it('should emit checkedPassengers with single passenger', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1']);
      tick();

      expect(emittedValue).toEqual({
        'journey-1': ['PAX-001'],
      });
    }));

    it('should emit checkedPassengers with multiple passengers', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1', 'PAX-002 journey-1']);
      tick();

      expect(emittedValue).toEqual({
        'journey-1': ['PAX-001', 'PAX-002'],
      });
    }));

    it('should handle passenger IDs with additional segments', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1 INF-001']);
      tick();

      expect(emittedValue).toEqual({
        'journey-1': ['PAX-001', 'INF-001'],
      });
    }));

    it('should handle multiple passengers with additional segments', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1 INF-001', 'PAX-002 journey-1 INF-002']);
      tick();

      expect(emittedValue).toEqual({
        'journey-1': ['PAX-001', 'INF-001', 'PAX-002', 'INF-002'],
      });
    }));

    it('should create empty array for journey when values exist', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1']);
      tick();

      expect(emittedValue['journey-1']).toBeDefined();
      expect(Array.isArray(emittedValue['journey-1'])).toBe(true);
    }));

    it('should parse passenger IDs correctly from space-separated values', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.onCheckedPassengers(['PAX-001 journey-1', 'PAX-003 journey-1']);
      tick();

      expect(emittedValue['journey-1']).toContain('PAX-001');
      expect(emittedValue['journey-1']).toContain('PAX-003');
      expect(emittedValue['journey-1'].length).toBe(2);
    }));
  });

  describe('internalInit', () => {
    it('should call handleCheckInAvailable', fakeAsync(() => {
      spyOn(component as any, 'handleCheckInAvailable').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).handleCheckInAvailable).toHaveBeenCalled();
    }));

    it('should call setJourneyScheduleData', fakeAsync(() => {
      spyOn(component as any, 'setJourneyScheduleData').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).setJourneyScheduleData).toHaveBeenCalled();
    }));

    it('should call setScheduleConfig', fakeAsync(() => {
      spyOn(component as any, 'setScheduleConfig').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).setScheduleConfig).toHaveBeenCalled();
    }));

    it('should call setAlertPanelConfig', fakeAsync(() => {
      spyOn(component as any, 'setAlertPanelConfig').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).setAlertPanelConfig).toHaveBeenCalled();
    }));

    it('should call setRemainingTimeConfig', fakeAsync(() => {
      spyOn(component as any, 'setRemainingTimeConfig').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).setRemainingTimeConfig).toHaveBeenCalled();
    }));

    it('should call handlePassengersForm', fakeAsync(() => {
      spyOn(component as any, 'handlePassengersForm').and.callThrough();

      (component as any).internalInit();
      tick();

      expect((component as any).handlePassengersForm).toHaveBeenCalled();
    }));

    it('should execute all initialization methods in correct order', fakeAsync(() => {
      const callOrder: string[] = [];

      spyOn(component as any, 'handleCheckInAvailable').and.callFake(() => {
        callOrder.push('handleCheckInAvailable');
      });
      spyOn(component as any, 'setJourneyScheduleData').and.callFake(() => {
        callOrder.push('setJourneyScheduleData');
      });
      spyOn(component as any, 'setScheduleConfig').and.callFake(() => {
        callOrder.push('setScheduleConfig');
      });
      spyOn(component as any, 'setAlertPanelConfig').and.callFake(() => {
        callOrder.push('setAlertPanelConfig');
      });
      spyOn(component as any, 'setRemainingTimeConfig').and.callFake(() => {
        callOrder.push('setRemainingTimeConfig');
      });
      spyOn(component as any, 'handlePassengersForm').and.callFake(() => {
        callOrder.push('handlePassengersForm');
      });

      (component as any).internalInit();
      tick();

      expect(callOrder).toEqual([
        'handleCheckInAvailable',
        'setJourneyScheduleData',
        'setScheduleConfig',
        'setAlertPanelConfig',
        'setRemainingTimeConfig',
        'handlePassengersForm',
      ]);
    }));
  });

  describe('getAllowedPassengers', () => {
    it('should return only passengers with ALLOWED status', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const allowedPassengers = (component as any).getAllowedPassengers();

      expect(allowedPassengers.length).toBe(2);
      expect(allowedPassengers[0].id).toBe('PAX-001');
      expect(allowedPassengers[0].status).toBe(PaxSegmentCheckinStatus.ALLOWED);
      expect(allowedPassengers[1].id).toBe('PAX-002');
      expect(allowedPassengers[1].status).toBe(PaxSegmentCheckinStatus.ALLOWED);
    }));

    it('should return empty array when no passengers are ALLOWED', fakeAsync(() => {
      const dataNoAllowed: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.CHECKED_IN },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.NOT_ALLOWED },
        ],
      };
      fixture.componentRef.setInput('data', dataNoAllowed);
      tick();

      component.ngOnInit();
      tick();

      const allowedPassengers = (component as any).getAllowedPassengers();

      expect(allowedPassengers.length).toBe(0);
    }));

    it('should filter out NOT_ALLOWED passengers', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const allowedPassengers = (component as any).getAllowedPassengers();
      const hasNotAllowed = allowedPassengers.some(
        (p: CheckInSummaryPassengerVM) => p.status === PaxSegmentCheckinStatus.NOT_ALLOWED
      );

      expect(hasNotAllowed).toBe(false);
    }));
  });

  describe('handlePassengersForm', () => {
    it('should populate passengersCheckboxModel correctly', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.passengersCheckboxModel.length).toBe(2);
      expect(component.passengersCheckboxModel[0]).toEqual({
        label: 'John Doe',
        id: 'PAX-001',
        value: 'PAX-001',
      });
      expect(component.passengersCheckboxModel[1]).toEqual({
        label: 'Jane Smith',
        id: 'PAX-002',
        value: 'PAX-002',
      });
    }));

    it('should set value as passenger id for ALLOWED status', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const model = component.passengersCheckboxModel[0];
      expect(model.value).toBe('PAX-001');
    }));

    it('should initialize passengersFields with correct structure', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.passengersFields.length).toBe(2);
      expect(component.passengersFields[0]).toEqual({
        label: 'John Doe',
        value: false,
        id: 'PAX-001',
      });
    }));

    it('should set value as false in passengersFields by default', fakeAsync(() => {
      component.ngOnInit();
      tick();

      for (const field of component.passengersFields) {
        expect(field.value).toBe(false);
      }
    }));
  });

  describe('setAlertPanelConfig', () => {
    it('should set WARNING alert when some passengers are NOT_ALLOWED', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig.alertType).toBe(AlertPanelType.WARNING);
    }));

    it('should use correct translation for NOT_ALLOWED passengers', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig.title).toBe('Some passengers must check-in at airport counter');
    }));

    it('should set ariaAttributes with journey id', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig.ariaAttributes).toBeDefined();
      expect(component.alertPanelConfig.ariaAttributes?.ariaLabelledBy).toBe('journey-1');
    }));

    it('should set NEUTRAL alert when check-in not available and no remaining time', fakeAsync(() => {
      const dataWithoutTime = {
        ...mockJourneyDataNotAvailable,
        remainingTimeToCheckIn: undefined,
      };
      fixture.componentRef.setInput('data', dataWithoutTime);
      tick();

      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig.alertType).toBe(AlertPanelType.NEUTRAL);
      expect(component.alertPanelConfig.title).toBe('Check-in not available');
    }));

    it('should not show remaining time title when showRemainingTime is false', fakeAsync(() => {
      fixture.componentRef.setInput('data', mockJourneyDataNotAvailable);
      fixture.componentRef.setInput('config', { showRemainingTime: false });
      tick();

      component.ngOnInit();
      tick();

      expect(component.alertPanelConfig.title).toBe('Check-in not available');
    }));
  });

  describe('setScheduleConfig', () => {
    it('should set scheduleConfig with OPERATED_BY carrier display mode', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.scheduleConfig).toBeDefined();
      expect(component.scheduleConfig.scheduleConfig).toBeDefined();
    }));
  });

  describe('setJourneyScheduleData', () => {
    it('should assign data to journeyDataConfig', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.journeyDataConfig).toBe(mockJourneyData as any);
    }));

    it('should maintain all journey properties', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.journeyDataConfig.id).toBe(mockJourneyData.id);
      expect(component.journeyDataConfig.segments).toEqual(mockJourneyData.segments);
    }));
  });

  describe('setRemainingTimeConfig', () => {
    it('should set correct dictionary keys for remaining time', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.remainingTimeConfig.labelDictionaryKey).toBe('CheckIn');
    }));
  });

  describe('signals', () => {
    it('should initialize showAlertMessage as false', () => {
      expect(component.showAlertMessage()).toBe(false);
    });

    it('should initialize summaryItemPanelConfig with SHADOW appearance', () => {
      expect(component.summaryItemPanelConfig().appearance).toBe(PanelAppearance.SHADOW);
    });

    it('should initialize showCheckBoxElements as empty array', () => {
      expect(component.showCheckBoxElements()).toEqual([]);
    });

    it('should update showCheckBoxElements signal after init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.showCheckBoxElements().length).toBeGreaterThan(0);
    }));

    it('should update summaryItemPanelConfig signal when check-in not available', fakeAsync(() => {
      fixture.componentRef.setInput('data', mockJourneyDataNotAvailable);
      tick();

      component.ngOnInit();
      tick();

      expect(component.summaryItemPanelConfig().appearance).toBe(PanelAppearance.BORDER);
    }));
  });

  describe('outputs', () => {
    it('should emit checkedPassengers output', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.ngOnInit();
      tick();

      component.onCheckedPassengers(['PAX-001 journey-1']);
      tick();

      expect(emittedValue).toBeDefined();
      expect(emittedValue['journey-1']).toContain('PAX-001');
    }));
  });

  describe('viewChildren', () => {
    it('should define passengerListElement as viewChildren query', () => {
      expect(component.passengerListElement).toBeDefined();
    });
  });

  describe('host classes', () => {
    it('should apply checkin-summary-item class', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const element = fixture.nativeElement;
      expect(element.className).toContain('checkin-summary-item');
    }));

    it('should set isCheckInAvailable to false when check-in not available', fakeAsync(() => {
      fixture.componentRef.setInput('data', mockJourneyDataNotAvailable);
      fixture.componentRef.setInput('config', mockConfig);
      fixture.detectChanges();
      tick();

      expect(component.isCheckInAvailable).toBe(false);
    }));

    it('should set isCheckInAvailable to true when check-in is available', fakeAsync(() => {
      // Already set in beforeEach with mockJourneyData
      fixture.detectChanges();
      tick();

      expect(component.isCheckInAvailable).toBe(true);
    }));
  });

  describe('edge cases', () => {
    it('should handle empty passengers array', fakeAsync(() => {
      const dataEmpty: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [],
      };
      fixture.componentRef.setInput('data', dataEmpty);
      tick();

      component.ngOnInit();
      tick();

      expect(component.showCheckBoxElements().length).toBe(0);
      expect(component.passengersCheckboxModel.length).toBe(0);
      expect(component.passengersFields.length).toBe(0);
    }));

    it('should handle all passengers with CHECKED_IN status', fakeAsync(() => {
      const dataAllCheckedIn: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.CHECKED_IN },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.CHECKED_IN },
        ],
      };
      fixture.componentRef.setInput('data', dataAllCheckedIn);
      tick();

      component.ngOnInit();
      tick();

      expect(component.showCheckBoxElements().length).toBe(0);
      expect(component.shouldShowSelectAllCheckbox()).toBe(false);
    }));

    it('should handle passenger without infant detail', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const passengerWithoutInfant = component.passengersCheckboxModel.find(
        (p) => p.id === 'PAX-002'
      );
      expect(passengerWithoutInfant).toBeDefined();
      expect(passengerWithoutInfant?.label).toBe('Jane Smith');
    }));

    it('should handle onCheckedPassengers with passenger ID without third segment', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.ngOnInit();
      tick();

      component.onCheckedPassengers(['PAX-002 journey-1']);
      tick();

      expect(emittedValue['journey-1']).toEqual(['PAX-002']);
      expect(emittedValue['journey-1'].length).toBe(1);
    }));

    it('should handle setTimeout callback for showAlertMessage', fakeAsync(() => {
      component.ngOnInit();
      tick();

      component.onSelectAllPassengersChanged(true);
      expect(component.showAlertMessage()).toBe(true);

      tick(500);
      expect(component.showAlertMessage()).toBe(true);

      tick(500);
      expect(component.showAlertMessage()).toBe(false);
    }));
  });

  describe('hasCheckedPassengers', () => {
    it('should return true when at least one passenger has CHECKED_IN status', fakeAsync(() => {
      const dataWithCheckedIn: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.CHECKED_IN },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.ALLOWED },
        ],
      };
      fixture.componentRef.setInput('data', dataWithCheckedIn);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasCheckedPassengers()).toBe(true);
    }));

    it('should return false when no passengers have CHECKED_IN status', fakeAsync(() => {
      const dataWithoutCheckedIn: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.ALLOWED },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.NOT_ALLOWED },
        ],
      };
      fixture.componentRef.setInput('data', dataWithoutCheckedIn);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasCheckedPassengers()).toBe(false);
    }));

    it('should return true when all passengers have CHECKED_IN status', fakeAsync(() => {
      const dataAllCheckedIn: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [
          { ...mockPassengers[0], status: PaxSegmentCheckinStatus.CHECKED_IN },
          { ...mockPassengers[1], status: PaxSegmentCheckinStatus.CHECKED_IN },
        ],
      };
      fixture.componentRef.setInput('data', dataAllCheckedIn);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasCheckedPassengers()).toBe(true);
    }));

    it('should return false for empty passengers array', fakeAsync(() => {
      const dataEmpty: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [],
      };
      fixture.componentRef.setInput('data', dataEmpty);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasCheckedPassengers()).toBe(false);
    }));
  });

  describe('hasStandbyOrOverbookingForSegment', () => {
    const mockPassengersWithSegmentsInfo: CheckInSummaryPassengerVM[] = [
      {
        ...mockPassengers[0],
        segmentsInfo: [
          { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
        ] as any,
      },
      {
        ...mockPassengers[1],
        segmentsInfo: [
          { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.ALLOWED },
        ] as any,
      },
    ];

    it('should return true when a passenger has STAND_BY status for the segment', fakeAsync(() => {
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: mockPassengersWithSegmentsInfo,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasStandbyOrOverbookingForSegment('segment-1')).toBe(true);
    }));

    it('should return true when a passenger has OVERBOOKED status for the segment', fakeAsync(() => {
      const passengersWithOverbooking: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          ] as any,
        },
      ];
      const dataWithOverbooking: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithOverbooking,
      };
      fixture.componentRef.setInput('data', dataWithOverbooking);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasStandbyOrOverbookingForSegment('segment-1')).toBe(true);
    }));

    it('should return false when no passenger has STAND_BY or OVERBOOKED status for the segment', fakeAsync(() => {
      const passengersNoStandby: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.ALLOWED },
          ] as any,
        },
        {
          ...mockPassengers[1],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
          ] as any,
        },
      ];
      const dataNoStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersNoStandby,
      };
      fixture.componentRef.setInput('data', dataNoStandby);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasStandbyOrOverbookingForSegment('segment-1')).toBe(false);
    }));

    it('should return false for a non-matching segment ID', fakeAsync(() => {
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: mockPassengersWithSegmentsInfo,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      expect(component.hasStandbyOrOverbookingForSegment('segment-999')).toBe(false);
    }));

    it('should return false when passengers have no segmentsInfo', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.hasStandbyOrOverbookingForSegment('segment-1')).toBe(false);
    }));
  });

  describe('allPassengersAreCheckedInForSegment', () => {
    it('should return true when all passengers in segment are CHECKED_IN', fakeAsync(() => {
      const passengersAllCheckedIn: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
          ] as any,
        },
        {
          ...mockPassengers[1],
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
          ] as any,
        },
      ];
      const dataAllCheckedIn: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersAllCheckedIn,
      };
      fixture.componentRef.setInput('data', dataAllCheckedIn);
      tick();

      component.ngOnInit();
      tick();

      expect(component.allPassengersAreCheckedForSegment('segment-1')).toBe(true);
    }));

    it('should return false when at least one passenger in segment is not CHECKED_IN', fakeAsync(() => {
      const passengersMixed: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
          ] as any,
        },
        {
          ...mockPassengers[1],
          status: PaxSegmentCheckinStatus.ALLOWED,
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.ALLOWED },
          ] as any,
        },
      ];
      const dataMixed: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersMixed,
      };
      fixture.componentRef.setInput('data', dataMixed);
      tick();

      component.ngOnInit();
      tick();

      expect(component.allPassengersAreCheckedForSegment('segment-1')).toBe(false);
    }));

    it('should return true for empty passengers array (vacuous truth)', fakeAsync(() => {
      const dataEmpty: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: [],
      };
      fixture.componentRef.setInput('data', dataEmpty);
      tick();

      component.ngOnInit();
      tick();

      expect(component.allPassengersAreCheckedForSegment('segment-1')).toBe(true);
    }));

    it('should return true when no passengers belong to the specified segment', fakeAsync(() => {
      const passengersOtherSegment: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          status: PaxSegmentCheckinStatus.ALLOWED,
          segmentsInfo: [
            { segmentId: 'segment-2', status: PaxSegmentCheckinStatus.ALLOWED },
          ] as any,
        },
      ];
      const dataOtherSegment: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersOtherSegment,
      };
      fixture.componentRef.setInput('data', dataOtherSegment);
      tick();

      component.ngOnInit();
      tick();

      expect(component.allPassengersAreCheckedForSegment('segment-1')).toBe(true);
    }));
  });

  describe('getAlertPanelConfigForSegment', () => {
    it('should return config with standby title when passenger has STAND_BY status for segment', fakeAsync(() => {
      const passengersWithStandby: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          ] as any,
        },
      ];
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithStandby,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.alertType).toBe(AlertPanelType.WARNING);
    }));

    it('should return config with overbooking title when passenger has OVERBOOKED status for segment', fakeAsync(() => {
      const passengersWithOverbooking: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          ] as any,
        },
      ];
      const dataWithOverbooking: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithOverbooking,
      };
      fixture.componentRef.setInput('data', dataWithOverbooking);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.alertType).toBe(AlertPanelType.WARNING);
    }));

    it('should return null when no passenger has STAND_BY or OVERBOOKED status for segment', fakeAsync(() => {
      const passengersNormal: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.ALLOWED },
          ] as any,
        },
        {
          ...mockPassengers[1],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.CHECKED_IN },
          ] as any,
        },
      ];
      const dataNormal: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersNormal,
      };
      fixture.componentRef.setInput('data', dataNormal);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).toBeNull();
    }));

    it('should return null for a non-matching segment ID', fakeAsync(() => {
      const passengersWithStandby: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          ] as any,
        },
      ];
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithStandby,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-999');

      expect(config).toBeNull();
    }));

    it('should prioritize standby over overbooking when both exist for segment', fakeAsync(() => {
      const passengersWithBoth: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          ] as any,
        },
        {
          ...mockPassengers[1],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          ] as any,
        },
      ];
      const dataWithBoth: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithBoth,
      };
      fixture.componentRef.setInput('data', dataWithBoth);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.alertType).toBe(AlertPanelType.WARNING);
      // When hasStandby is true, it uses standby title
      expect(config?.description).toBeDefined();
    }));

    it('should return config without description for overbooking only', fakeAsync(() => {
      const passengersWithOverbooking: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          ] as any,
        },
      ];
      const dataWithOverbooking: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithOverbooking,
      };
      fixture.componentRef.setInput('data', dataWithOverbooking);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.description).toBeUndefined();
    }));

    it('should show OCA alert when isOcaEnabled is true and passenger has STAND_BY status', fakeAsync(() => {
      mockStorageService.getSessionStorage.and.returnValue(true);
      const passengersWithStandby: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          ] as any,
        },
      ];
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithStandby,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.title).toBe('On Call Availability');
      expect(config?.description).toBe('Your seat is subject to availability');
    }));

    it('should show Overbooking alert when isOcaEnabled is false and passenger has STAND_BY status', fakeAsync(() => {
      mockStorageService.getSessionStorage.and.returnValue(false);
      const passengersWithStandby: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.STAND_BY },
          ] as any,
        },
      ];
      const dataWithStandby: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithStandby,
      };
      fixture.componentRef.setInput('data', dataWithStandby);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.title).toBe('Overbooking Alert');
      expect(config?.description).toBeUndefined();
    }));

    it('should show Overbooking alert when passenger has OVERBOOKED status regardless of isOcaEnabled', fakeAsync(() => {
      mockStorageService.getSessionStorage.and.returnValue(true);
      const passengersWithOverbooking: CheckInSummaryPassengerVM[] = [
        {
          ...mockPassengers[0],
          segmentsInfo: [
            { segmentId: 'segment-1', status: PaxSegmentCheckinStatus.OVERBOOKED },
          ] as any,
        },
      ];
      const dataWithOverbooking: CheckInSummaryJourneyVM = {
        ...mockJourneyData,
        passengers: passengersWithOverbooking,
      };
      fixture.componentRef.setInput('data', dataWithOverbooking);
      tick();

      component.ngOnInit();
      tick();

      const config = component.getAlertPanelConfigForSegment('segment-1');

      expect(config).not.toBeNull();
      expect(config?.title).toBe('Overbooking Alert');
      expect(config?.description).toBeUndefined();
    }));
  });

  describe('integration scenarios', () => {
    it('should handle full select-all flow', fakeAsync(() => {
      let emittedValue: any;
      component.checkedPassengers.subscribe((value) => {
        emittedValue = value;
      });

      component.ngOnInit();
      tick();

      // Select all passengers
      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.selectAllChecked).toBe(true);
      expect(component.passengersFields[0].value).toBe('PAX-001 journey-1');
      expect(component.passengersFields[1].value).toBe('PAX-002 journey-1');

      // Emit checked passengers
      component.onCheckedPassengers(['PAX-001 journey-1', 'PAX-002 journey-1']);
      tick();

      expect(emittedValue).toEqual({
        'journey-1': ['PAX-001', 'PAX-002'],
      });

      // Deselect all
      component.onSelectAllPassengersChanged(false);
      tick(1000);

      expect(component.selectAllChecked).toBe(false);
      expect(component.showAlertMessage()).toBe(false);
    }));

    it('should correctly initialize with mixed passenger statuses', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.data().passengers.length).toBe(3);
      expect(component.showCheckBoxElements().length).toBe(2);
      expect(component.passengersCheckboxModel.length).toBe(2);
      expect(component.alertPanelConfig.alertType).toBe(AlertPanelType.WARNING);
    }));

    it('should maintain data integrity through multiple operations', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const initialPassengers = component.passengersCheckboxModel.length;

      component.onSelectAllPassengersChanged(true);
      tick();

      expect(component.passengersCheckboxModel.length).toBe(initialPassengers);

      component.onSelectAllPassengersChanged(false);
      tick(1000);

      expect(component.passengersCheckboxModel.length).toBe(initialPassengers);
    }));
  });
});
