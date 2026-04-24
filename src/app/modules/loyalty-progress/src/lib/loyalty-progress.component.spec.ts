import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
import { LoyaltyProgressComponent } from './loyalty-progress.component';
import { LoyaltyProgressConfig } from './models/loyalty-progress.config';

describe('LoyaltyProgressComponent', () => {
  let component: LoyaltyProgressComponent;
  let fixture: ComponentFixture<LoyaltyProgressComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
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

    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.callFake((key: string) => key);
  });

  beforeEach(() => {
    mockLoggerService.info.calls.reset();
    mockComposerService.updateComposerRegisterStatus.calls.reset();
    mockComposerService.notifyComposerEvent.calls.reset();
    mockConfigService.getBusinessModuleConfig.calls.reset();
    mockConfigService.getTranslationConfig.calls.reset();
    mockConfigService.getCommonConfig.calls.reset();
    mockConfigService.getDataModuleId.calls.reset();
    mockTranslateService.instant.calls.reset();

    TestBed.configureTestingModule({
      imports: [HttpClientModule, LoyaltyProgressComponent, BrowserAnimationsModule],
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
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(LoyaltyProgressComponent);
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
      const config: LoyaltyProgressConfig = DATA_INITIAL_VALUE;
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
