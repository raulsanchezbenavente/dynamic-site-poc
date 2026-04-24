import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CorporateFooterMainComponent } from './footer-main.component';
import {
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  ComposerStatusEnum,
  ConfigService,
  LoggerService,
  ComposerService,
  ViewportSizeService,
  DataModule,
} from '@dcx/ui/libs';
import { of, Subject } from 'rxjs';
import { DATA_INITIAL_VALUE } from './stories/data/data-inital-value.fake';
import { ModuleTranslationService } from '@dcx/module/translation';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FooterMainComponent', () => {
  let component: CorporateFooterMainComponent;
  let fixture: ComponentFixture<CorporateFooterMainComponent>;

  const mockData: DataModule = {
    id: 'footer-main-id',
    config: 'footer-config-id',
    name: ''
  };

  const composerNotifier$ = new Subject<ComposerEvent>();

  const moduleTranslationServiceStub: Partial<ModuleTranslationService> = {
    loadModuleTranslations: () => of(true),
  } as any;

  let configServiceMock: jasmine.SpyObj<ConfigService>;
  let composerServiceMock: jasmine.SpyObj<ComposerService>;
  let loggerServiceMock: jasmine.SpyObj<LoggerService>;
  let viewportSizeServiceMock: jasmine.SpyObj<ViewportSizeService>;

  beforeEach(fakeAsync(() => {
    configServiceMock = jasmine.createSpyObj('ConfigService', [
      'getDataModuleId',
      'getBusinessModuleConfig',
    ]);
    configServiceMock.getDataModuleId.and.returnValue(mockData);
    configServiceMock.getBusinessModuleConfig.and.returnValue(of(DATA_INITIAL_VALUE));

    composerServiceMock = jasmine.createSpyObj('ComposerService', [
      'updateComposerRegisterStatus',
      'notifyComposerEvent',
    ]);
    composerServiceMock.notifier$ = composerNotifier$.asObservable();

    loggerServiceMock = jasmine.createSpyObj('LoggerService', ['info']);
    viewportSizeServiceMock = jasmine.createSpyObj('ViewportSizeService', ['getComponentLayoutBreakpoint']);
    viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(640);

    spyOn(globalThis, 'matchMedia').and.returnValue({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList);

    TestBed.configureTestingModule({
      imports: [
        CorporateFooterMainComponent,
        NoopAnimationsModule,
        i18nTestingImportsWithMemoryLoader({}),
      ],
      providers: [
        provideHttpClient(),
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ComposerService, useValue: composerServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ViewportSizeService, useValue: viewportSizeServiceMock },
        { provide: ModuleTranslationService, useValue: moduleTranslationServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CorporateFooterMainComponent);
    component = fixture.componentInstance;

    tick(); // complete async setup
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize config on ngOnInit', fakeAsync(() => {
    tick(); // allow initConfig() observable to emit
    expect(configServiceMock.getBusinessModuleConfig).toHaveBeenCalledWith(mockData.config);
    expect(loggerServiceMock.info).toHaveBeenCalledWith('FooterMainComponent', 'Business module config', jasmine.any(Object));
    expect(composerServiceMock.updateComposerRegisterStatus).toHaveBeenCalledWith(mockData.id, ComposerStatusEnum.LOADED);
    expect(component.isLoaded()).toBeTrue();
  }));

  it('should update selectedMenu on toggleMenu when responsive', fakeAsync(() => {
    component.isResponsive.set(true);
    component.selectedMenu.set('footerNavMenuId-1');

    component.toggleMenu('footerNavMenuId-2');
    expect(component.selectedMenu()).toBe('footerNavMenuId-2');

    component.toggleMenu('footerNavMenuId-2');
    expect(component.selectedMenu()).toBe('');
  }));

  it('should not update selectedMenu on toggleMenu when not responsive', () => {
    component.isResponsive.set(false);
    component.selectedMenu.set('footerNavMenuId-3');

    component.toggleMenu('footerNavMenuId-2');

    expect(component.selectedMenu()).toBe('footerNavMenuId-3');
  });

  it('should handle composer notifier events for SubmitRequested', fakeAsync(() => {
    const event: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      status: ComposerEventStatusEnum.PENDING,
      componentId: mockData.id,
    };

    composerNotifier$.next(event);
    tick();

    expect(event.status).toBe(ComposerEventStatusEnum.SUCCESS);
    expect(composerServiceMock.notifyComposerEvent).toHaveBeenCalledWith(event);
  }));

  it('should ignore composer events with different componentId', fakeAsync(() => {
    const event: ComposerEvent = {
      type: ComposerEventTypeEnum.SubmitRequested,
      status: ComposerEventStatusEnum.PENDING,
      componentId: 'another-id',
    };

    composerNotifier$.next(event);
    tick();

    expect(event.status).toBe(ComposerEventStatusEnum.PENDING);
    expect(composerServiceMock.notifyComposerEvent).not.toHaveBeenCalled();
  }));
});
