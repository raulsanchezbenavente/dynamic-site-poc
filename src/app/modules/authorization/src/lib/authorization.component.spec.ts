import {
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  ComposerStatusEnum,
  DataModule,
  CommonConfig,
  ComposerService,
  ConfigService,
  LoggerService,
} from '@dcx/ui/libs';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { DATA_INITIAL_VALUE } from './stories/data/data-inital-value.fake';


import { AuthorizationComponent } from './authorization.component';
import { AuthorizationConfig } from './models/authorization.config';

describe('AuthorizationComponent', () => {
  let component: AuthorizationComponent;
  let fixture: ComponentFixture<AuthorizationComponent>;

  // Mocks
  const mockModuleBusinessConfig: AuthorizationConfig = DATA_INITIAL_VALUE;
  const mockElementRef = new ElementRef(document.createElement('div'));
  const mockDataModule: DataModule = { id: 'test-id', name: 'test-name', config: 'test-config' };
  const mockCommonBusinessConfig = { commonData: 'value' };
  const composerNotifier$ = new Subject<ComposerEvent>();

  // Jasmine Spies for services
  const configServiceMock = {
    getDataModuleId: jasmine.createSpy('getDataModuleId').and.returnValue(mockDataModule),
    getBusinessModuleConfig: jasmine.createSpy('getBusinessModuleConfig').and.returnValue(of(mockModuleBusinessConfig)),
    getCommonConfig: jasmine.createSpy('getCommonConfig').and.returnValue(of(mockCommonBusinessConfig))
  };

  const composerServiceMock = {
    notifier$: composerNotifier$.asObservable(),
    notifyComposerEvent: jasmine.createSpy('notifyComposerEvent'),
    updateComposerRegisterStatus: jasmine.createSpy('updateComposerRegisterStatus')
  };

  const loggerServiceMock = {
    info: jasmine.createSpy('info'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    debug: jasmine.createSpy('debug'),
  };

  const translationServiceMock = {
    translate: jasmine.createSpy('translate').and.callFake((key: string) => key)
  };

  beforeEach(async () => {
    // Reset spies before each test run
    configServiceMock.getDataModuleId.calls.reset();
    configServiceMock.getBusinessModuleConfig.calls.reset();
    configServiceMock.getCommonConfig.calls.reset();
    composerServiceMock.notifyComposerEvent.calls.reset();
    composerServiceMock.updateComposerRegisterStatus.calls.reset();
    loggerServiceMock.info.calls.reset();
    loggerServiceMock.error.calls.reset();
    translationServiceMock.translate.calls.reset();

    // Pre-configure return values for spies called during component init
    configServiceMock.getDataModuleId.and.returnValue(mockDataModule);
    configServiceMock.getBusinessModuleConfig.and.returnValue(of(mockModuleBusinessConfig));
    configServiceMock.getCommonConfig.and.returnValue(of(mockCommonBusinessConfig));

    await TestBed.configureTestingModule({
      imports: [AuthorizationComponent],
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ComposerService, useValue: composerServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ElementRef, useValue: mockElementRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize configuration, subscribe to composer, and set loaded status on ngOnInit', fakeAsync(() => {
    // Arrange
    const subscribeComposerNotifierSpy = spyOn((component as any), 'subscribeComposerNotifier').and.callThrough();
    // Act
    (component as any).internalInit(); // This calls internalInit
    tick(); // Allow forkJoin, tap operators, and subscriptions to complete
    // Assert
    expect(configServiceMock.getBusinessModuleConfig).toHaveBeenCalledWith(mockDataModule.config);
    expect(component.config()).toEqual(mockModuleBusinessConfig);
    expect(configServiceMock.getCommonConfig).toHaveBeenCalledWith(CommonConfig.BUSINESS_CONFIG);
    expect(subscribeComposerNotifierSpy).toHaveBeenCalled();
    expect(composerServiceMock.updateComposerRegisterStatus).toHaveBeenCalledWith(mockDataModule.id, ComposerStatusEnum.LOADED);
  }));

  it('should process SubmitRequested events from composer notifier after initialization', fakeAsync(() => {
    // Arrange: Initialize component fully
    (component as any).internalInit();
    tick(); // Ensure all async init tasks are done, including subscription to notifier$
    const mockEvent: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: mockDataModule.id, // Matches component's data module id
      status: ComposerEventStatusEnum.REQUESTED,
    };
    const expectedEventAfterProcessing: ComposerEvent = {
      ...mockEvent,
      status: ComposerEventStatusEnum.SUCCESS // Status should be updated
    };
    // Act
    composerNotifier$.next(mockEvent); // Emit the event
    fixture.detectChanges(); // Allow event processing and potential view updates
    // Assert
    expect(composerServiceMock.notifyComposerEvent).toHaveBeenCalledTimes(1);
    expect(composerServiceMock.notifyComposerEvent).toHaveBeenCalledWith(expectedEventAfterProcessing);
  }));

  it('should ignore irrelevant events from composer notifier', fakeAsync(() => {
    // Arrange: Initialize component fully
    (component as any).internalInit();
    tick(); // Ensure all async init tasks are done
    const irrelevantEventWrongType: ComposerEvent = {
      type: ComposerEventTypeEnum.RenderRequested,
      componentId: mockDataModule.id,
      status: ComposerEventStatusEnum.REQUESTED,
    };
    const irrelevantEventWrongId: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: 'another-component-id',
      status: ComposerEventStatusEnum.REQUESTED,
    };
    // Act
    composerNotifier$.next(irrelevantEventWrongType);
    composerNotifier$.next(irrelevantEventWrongId);
    fixture.detectChanges();
    // Assert
    expect(composerServiceMock.notifyComposerEvent).not.toHaveBeenCalled();
  }));
});
