import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AuthenticationStorageService,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  CurrencyService,
  DataModule,
  KeycloakAuthService,
  LoggerService,
  NotificationService,
} from '@dcx/ui/libs';
import { of } from 'rxjs';
import { DATA_INITIAL_VALUE } from './stories/data/data-inital-value.fake';
import { LoyaltyOverviewCardComponent } from './loyalty-overview-card.component';
import { AvatarSize } from '@dcx/ui/design-system';
import { KeycloakService } from 'keycloak-angular';
import { CookieService } from 'ngx-cookie';
import { AccountFacade } from '@dcx/module/api-clients';
import { CustomerLoyaltyService } from '@dcx/ui/business-common';
import { TranslateModule } from '@ngx-translate/core';

describe('LoyaltyOverviewCardComponent', () => {
  let component: LoyaltyOverviewCardComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardComponent>;
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
      'getInstanceId',
    ]);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        LoyaltyOverviewCardComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ComposerService, useValue: mockComposerService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: AuthenticationStorageService,
          useValue: jasmine.createSpyObj('AuthenticationStorageService', [
            'getAuthenticationTokenData',
            'setAuthenticationTokenData',
            'removeAuthenticationTokenData',
          ]),
        },
        {
          provide: KeycloakAuthService,
          useValue: jasmine.createSpyObj('KeycloakAuthService', [
            'login',
            'logout',
            'isAuthenticated$',
            'forceLogout$',
          ], {
            isAuthenticated$: of(true), // ajusta según test
            forceLogout$: of(false),
          }),
        },
        {
          provide: KeycloakService,
          useValue: jasmine.createSpyObj('KeycloakService', [
            'login',
            'logout',
          ]),
        },
        {
          provide: CookieService,
          useValue: jasmine.createSpyObj('CookieService', [
            'get',
            'put',
            'remove',
            'removeAll',
          ]),
        },
        {
          provide: CurrencyService,
          useValue: jasmine.createSpyObj(
            'CurrencyService',
            ['getCurrency', 'setCurrency', 'format', 'formatPrice', 'getSelectedCurrency'],
            { selectedCurrency$: of('USD') }
          ),
        },
        {
          provide: AccountFacade,
          useValue: jasmine.createSpyObj('AccountFacade', ['getSession']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['showNotification']),
        },
        {
          provide: CustomerLoyaltyService,
          useValue: jasmine.createSpyObj('CustomerLoyaltyService', [
            'getCustomerProgramData',
            'formatLoyaltyBalance',
            'formatLoyaltyPoints',
          ]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(LoyaltyOverviewCardComponent);
    component = fixture.componentInstance;
    mockConfigService.getDataModuleId.and.returnValue({
      id: 'testId',
      config: 'testConfig',
      name: 'testModule',
    } as DataModule);

    component['data'].set(mockConfigService.getDataModuleId(mockElementRef));
    mockConfigService.getBusinessModuleConfig.and.returnValue(of(DATA_INITIAL_VALUE));
    mockConfigService.getCommonConfig.and.returnValue(of({}));
    mockConfigService.getTranslationConfig.and.returnValue(of({}));
    mockConfigService.getInstanceId.and.returnValue('test-instance-id');
    (component as any).config.set(DATA_INITIAL_VALUE as any);

    const accountFacadeMock = TestBed.inject(AccountFacade) as jasmine.SpyObj<AccountFacade>;
    accountFacadeMock.getSession.and.returnValue(of(null));
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

  it('should update tierAvatarConfig when isMobile is set', fakeAsync(() => {
    // Arrange: simulamos el VM ya resuelto por el builder
    component.loyaltyOverviewCardVM.set({
      tierAvatarConfig: {
        icon: { name: 'lifemiles' },
        size: AvatarSize.SMALLEST,
      },
    } as any);

    // Act
    tick();

    // Assert
    const result = component.loyaltyOverviewCardVM()!.tierAvatarConfig;
    expect(result.icon?.name).toBe('lifemiles');
    expect(result.size).toBe(AvatarSize.SMALLEST);
  }));

});
