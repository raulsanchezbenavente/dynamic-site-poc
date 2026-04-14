// projects/breadcrumb/src/lib/breadcrumb.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

import { BreadcrumbComponent } from './breadcrumb.component';

import {
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
} from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// ====== Mocks ======
class MockConfigService {
  getDataModuleId = jasmine.createSpy('getDataModuleId').and.returnValue({
    id: 'breadcrumb-1',
    config: 'breadcrumb-config-key',
  } as unknown as DataModule);

  getBusinessModuleConfig = jasmine.createSpy('getBusinessModuleConfig');
  getCommonConfig = jasmine.createSpy('getCommonConfig');
}

class MockComposerService {
  notifier$ = new Subject<ComposerEvent>();
  updateComposerRegisterStatus = jasmine.createSpy('updateComposerRegisterStatus');
  notifyComposerEvent = jasmine.createSpy('notifyComposerEvent');
}

class MockLoggerService {
  info = jasmine.createSpy('info');
}

describe('BreadcrumbComponent (standalone)', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let component: BreadcrumbComponent;

  let configSvc: MockConfigService;
  let composer: MockComposerService;
  let logger: MockLoggerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, TranslateModule.forRoot(), HttpClientTestingModule], 
      providers: [
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: ComposerService, useClass: MockComposerService },
        { provide: LoggerService, useClass: MockLoggerService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;

    configSvc = TestBed.inject(ConfigService) as unknown as MockConfigService;
    composer = TestBed.inject(ComposerService) as unknown as MockComposerService;
    logger = TestBed.inject(LoggerService) as unknown as MockLoggerService;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit/internalInit: initializes configs, marks LOADED, sets homeIconConfig and logs', () => {
    const businessModuleConfig = {
      home: { title: 'Inicio' },
      items: [],
    } as any;

    const commonBusinessConfig = { something: 'value' };

    configSvc.getBusinessModuleConfig.and.returnValue(of(businessModuleConfig));
    configSvc.getCommonConfig.and.callFake((key: CommonConfig) => {
      expect(key).toBe(CommonConfig.BUSINESS_CONFIG);
      return of(commonBusinessConfig);
    });

    component.ngOnInit();

    expect(configSvc.getDataModuleId).toHaveBeenCalled();
    const data = (configSvc.getDataModuleId as jasmine.Spy).calls.mostRecent()
      .returnValue as unknown as DataModule;

    expect(configSvc.getBusinessModuleConfig).toHaveBeenCalledWith(data.config);
    expect(configSvc.getCommonConfig).toHaveBeenCalledWith(CommonConfig.BUSINESS_CONFIG);

    expect(component.config()).toEqual(businessModuleConfig);

    expect(component.homeIconConfig).toEqual({
      name: 'home',
      ariaAttributes: { ariaLabel: 'Inicio' },
    });

    expect(logger.info).toHaveBeenCalledWith('BreadCrumb', 'Business module config', businessModuleConfig);
    expect(logger.info).toHaveBeenCalledWith('BreadCrumb', 'Business config', commonBusinessConfig);

    expect(composer.updateComposerRegisterStatus)
      .toHaveBeenCalledWith(data.id, ComposerStatusEnum.LOADED);
    expect(component.isLoaded()).toBeTrue();
  });

  it('subscribeComposerNotifier: ignores events with different componentId', () => {
    configSvc.getBusinessModuleConfig.and.returnValue(of({} as any));
    configSvc.getCommonConfig.and.returnValue(of({}));
    component.ngOnInit();

    composer.notifyComposerEvent.calls.reset();

    const ev: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: 'otro-id',
    } as any;

    composer.notifier$.next(ev);
    expect(composer.notifyComposerEvent).not.toHaveBeenCalled();
  });

  it('subscribeComposerNotifier: with SubmitRequested and same ID → sets SUCCESS and notifies', () => {
    configSvc.getBusinessModuleConfig.and.returnValue(of({} as any));
    configSvc.getCommonConfig.and.returnValue(of({}));
    component.ngOnInit();

    const data = (configSvc.getDataModuleId as jasmine.Spy).calls.mostRecent()
      .returnValue as unknown as DataModule;

    composer.notifyComposerEvent.calls.reset();

    const ev: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: data.id,
    } as any;

    composer.notifier$.next(ev);

    expect(composer.notifyComposerEvent).toHaveBeenCalledTimes(1);
    const calledWith = (composer.notifyComposerEvent as jasmine.Spy).calls.mostRecent().args[0] as ComposerEvent;
    expect(calledWith.status).toBe(ComposerEventStatusEnum.SUCCESS);
  });

  it('takeUntilDestroyed: when component is destroyed it no longer notifies', () => {
    configSvc.getBusinessModuleConfig.and.returnValue(of({} as any));
    configSvc.getCommonConfig.and.returnValue(of({}));
    component.ngOnInit();

    const data = (configSvc.getDataModuleId as jasmine.Spy).calls.mostRecent()
      .returnValue as unknown as DataModule;

    fixture.destroy(); 
    
    composer.notifyComposerEvent.calls.reset();
    const ev: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: data.id,
    } as any;

    composer.notifier$.next(ev);
    expect(composer.notifyComposerEvent).not.toHaveBeenCalled();
  });

  it('should render a span without link when item is not last and has no url', () => {
    const businessModuleConfig = {
      home: { title: 'Home' },
      items: [
        { title: 'Level 1', url: '/level1' },
        { title: 'Level 2 No Link' },
        { title: 'Level 3', url: '/level3' },
      ],
    } as any;

    configSvc.getBusinessModuleConfig.and.returnValue(of(businessModuleConfig));
    configSvc.getCommonConfig.and.returnValue(of({}));

    component.ngOnInit();
    fixture.detectChanges();

    const breadcrumbItems = fixture.nativeElement.querySelectorAll('.breadcrumb_item');
    const secondItem = breadcrumbItems[1];
    const span = secondItem.querySelector('.breadcrumb-without-link');

    expect(span).toBeTruthy();
    expect(span.textContent.trim()).toBe('Level 2 No Link');
  });
});
