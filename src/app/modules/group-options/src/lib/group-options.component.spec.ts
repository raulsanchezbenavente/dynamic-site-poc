import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject, Subscription } from 'rxjs';
import { ElementRef } from '@angular/core';
import {
  CommonConfig,
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  ComposerStatusEnum,
  DataModule,
  ConfigService,
  ComposerService,
  LoggerService,
} from '@dcx/ui/libs';
import { GroupOptionElementData, GroupOptionsTemplateStyles, TitleHeading } from '@dcx/ui/design-system';

import { GroupOptionsComponent } from './group-options.component';
import { GroupOptionsConfig } from './models/group-options-config.model';

describe('GroupOptionsComponent', () => {
  let component: GroupOptionsComponent;
  let fixture: ComponentFixture<GroupOptionsComponent>;

  const mockDataModule: DataModule = { id: 'group-options-test-id', name: 'group-options-test-name', config: 'group-options-test-config' };
  const mockGroupOptionsConfig: GroupOptionsConfig = {
    culture: 'en-US',
    groupOptionsModel: {
      visuallyHiddenTitle: true,
      titleHeadingTag: TitleHeading.H2,
      titleHeadingStyle: TitleHeading.H1,
      titleText: 'Test Title',
      templateStyle: GroupOptionsTemplateStyles.HORIZONTAL,
      enableHorizontalScroll: false,
      templateGrid: '2',
      optionItemModels: [{ id: '1', title: 'Option 1', code: 'option-1' } as GroupOptionElementData],
      waitForAvailableOptions: false,
    },
  };
  const mockBusinessConfig = { commonData: 'value' };
  const mockElementRef = new ElementRef(document.createElement('div'));
  const composerNotifier$ = new Subject<ComposerEvent>();

  const configServiceMock = {
    getDataModuleId: jasmine.createSpy('getDataModuleId').and.returnValue(mockDataModule),
    getBusinessModuleConfig: jasmine.createSpy('getBusinessModuleConfig').and.returnValue(of(mockGroupOptionsConfig)),
    getCommonConfig: jasmine.createSpy('getCommonConfig').and.returnValue(of(mockBusinessConfig))
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

  beforeEach(async () => {
    configServiceMock.getDataModuleId.calls.reset();
    configServiceMock.getBusinessModuleConfig.calls.reset();
    configServiceMock.getCommonConfig.calls.reset();
    composerServiceMock.notifyComposerEvent.calls.reset();
    composerServiceMock.updateComposerRegisterStatus.calls.reset();
    loggerServiceMock.info.calls.reset();

    // Pre-configure return values for spies called during component init
    configServiceMock.getDataModuleId.and.returnValue(mockDataModule);
    configServiceMock.getBusinessModuleConfig.and.returnValue(of(mockGroupOptionsConfig));
    configServiceMock.getCommonConfig.and.returnValue(of(mockBusinessConfig));


    await TestBed.configureTestingModule({
      imports: [GroupOptionsComponent],
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ComposerService, useValue: composerServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ElementRef, useValue: mockElementRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupOptionsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should initialize on ngOnInit', fakeAsync(() => {
    // Arrange
    const initConfigSpy = spyOn((component as any), 'initConfig').and.callThrough();
    const getBusinessConfigSpy = spyOn((component as any), 'getBusinessConfig').and.callThrough();
    const subscribeComposerNotifierSpy = spyOn((component as any), 'subscribeComposerNotifier').and.callThrough();

    // Act
    component.ngOnInit();
    tick();

    // Assert
    expect(initConfigSpy).toHaveBeenCalled();
    expect(getBusinessConfigSpy).toHaveBeenCalled();
    expect(subscribeComposerNotifierSpy).toHaveBeenCalled();
    expect(composerServiceMock.updateComposerRegisterStatus).toHaveBeenCalledWith(mockDataModule.id, ComposerStatusEnum.LOADED);
    expect(component.isLoaded()).toBe(true);
  }));

  it('should initialize config on initConfig', fakeAsync(() => {
    // Arrange
    // configServiceMock.getBusinessModuleConfig is already set up in beforeEach

    // Act
    (component as any).initConfig().subscribe();
    tick();

    // Assert
    expect(configServiceMock.getBusinessModuleConfig).toHaveBeenCalledWith(mockDataModule.config);
    expect(component.config()).toEqual(mockGroupOptionsConfig);
    expect(loggerServiceMock.info).toHaveBeenCalledWith('GroupOptionsComponent', 'Business module config', mockGroupOptionsConfig);
  }));

  it('should subscribe to composer notifier on subscribeComposerNotifier and process event', fakeAsync(() => {
    // Arrange
    const mockEvent: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: mockDataModule.id,
      status: ComposerEventStatusEnum.REQUESTED,
    };
    const expectedEventAfterProcessing: ComposerEvent = {
      ...mockEvent,
      status: ComposerEventStatusEnum.SUCCESS
    };
    let subscription: Subscription | undefined;

    // Act
    subscription = (component as any).subscribeComposerNotifier();
    composerNotifier$.next(mockEvent);
    tick();

    // Assert
    expect(composerServiceMock.notifyComposerEvent).toHaveBeenCalledWith(expectedEventAfterProcessing);
    if (subscription) {
      subscription.unsubscribe(); // Clean up subscription manually as no takeUntilDestroyed is used
    }
  }));

  it('should get business config on getBusinessConfig', fakeAsync(() => {
    // Arrange
    // configServiceMock.getCommonConfig is already set up in beforeEach

    // Act
    (component as any).getBusinessConfig().subscribe();
    tick();

    // Assert
    expect(configServiceMock.getCommonConfig).toHaveBeenCalledWith(CommonConfig.BUSINESS_CONFIG);
    expect(loggerServiceMock.info).toHaveBeenCalledWith('GroupOptions', 'Business config', mockBusinessConfig);
  }));
});

