import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ElementRef } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
} from '@dcx/ui/libs';
import { of } from 'rxjs';
import { DATA_INITIAL_VALUE } from './stories/data/data-inital-value.fake';
import { LoyaltyStatusOverviewComponent } from './loyalty-status-overview.component';
import { LoyaltyStatusOverviewConfig } from './models/loyalty-status-overview.config';

describe('LoyaltyStatusOverviewComponent', () => {
  let component: LoyaltyStatusOverviewComponent;
  let fixture: ComponentFixture<LoyaltyStatusOverviewComponent>;
  let mockElementRef: jasmine.SpyObj<ElementRef>;
  let mockLoggerService: jasmine.SpyObj<LoggerService>;
  let mockComposerService: jasmine.SpyObj<ComposerService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  beforeAll(() => {
    mockLoggerService = jasmine.createSpyObj('LoggerService', ['info']);
    mockComposerService = jasmine.createSpyObj('ComposerService', [
      'updateComposerRegisterStatus',
      'notifyComposerEvent',
    ]);
    mockElementRef = jasmine.createSpyObj('ElementRef', [], { nativeElement: {} });
    mockConfigService = jasmine.createSpyObj('ConfigService', [
      'getBusinessModuleConfig',
      'getTranslationConfig',
      'getCommonConfig',
      'getDataModuleId',
    ]);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [],
      providers: [
        {
          provide: ElementRef,
          useValue: mockElementRef,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: ComposerService,
          useValue: mockComposerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(LoyaltyStatusOverviewComponent);
    component = fixture.componentInstance;
    mockConfigService.getDataModuleId.and.returnValue({
      id: 'testId',
      config: 'testConfig',
      name: 'testModule',
    } as DataModule);

    component['data'].set(mockConfigService.getDataModuleId(mockElementRef));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should updateComposerRegisterStatus on ngOnInit', fakeAsync(() => {
      mockConfigService.getBusinessModuleConfig.and.returnValue(
        of(DATA_INITIAL_VALUE)
      );
      mockConfigService.getTranslationConfig.and.returnValue(of({}));
      mockConfigService.getCommonConfig.and.returnValue(of({}));
      mockComposerService.notifier$ = of({
        type: 'SubmitRequested',
        componentId: 'testId',
        status: 'SUCCESS',
      });
      component.ngOnInit();
      tick();
      expect(mockComposerService.updateComposerRegisterStatus).toHaveBeenCalledWith(
        component['data']().id,
        ComposerStatusEnum.LOADED
      );
      expect(component.isLoaded()).toBeTrue();
    }));
  });

  describe('initConfig', () => {
    it('should initialize the configuration', () => {
      const config: LoyaltyStatusOverviewConfig = DATA_INITIAL_VALUE;
      const translationConfig = {
        /* mock translation configuration object */
      };
      const commonConfig = {
        /* mock common configuration object */
      };
      mockConfigService.getBusinessModuleConfig.and.returnValue(of(config));
      mockConfigService.getTranslationConfig.and.returnValue(of(translationConfig));
      mockConfigService.getCommonConfig.and.returnValue(of(commonConfig));

      component['initConfig']().subscribe(() => {
        expect(component.config()).toEqual(config);
      });
    });
  });

  describe('subscribeComposerNotifier', () => {
    it('should subscribe to the composer notifier and update event status', fakeAsync(() => {
      component['data'].set({ id: 'testId', config: 'testConfig' } as DataModule);

      const eventMock = {
        type: 'SubmitRequested',
        componentId: 'testId',
        status: 'PENDING',
      };

      mockComposerService.notifier$ = of(eventMock);

      component['subscribeComposerNotifier']();
      tick();

      expect(mockComposerService.notifyComposerEvent).toHaveBeenCalled();
      const event = mockComposerService.notifyComposerEvent.calls.mostRecent().args[0];
      expect(event.status).toBe('SUCCESS');
    }));
  });
});
