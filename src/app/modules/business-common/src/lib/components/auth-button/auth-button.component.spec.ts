import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { AccountClient, AccountV2Client, AccountV2Models } from '@dcx/module/api-clients';
import { ModalDialogService } from '@dcx/ui/design-system';
import {
  AuthService,
  CultureServiceEx,
  CurrencyFormatPipe,
  CurrencyService,
  KEYCLOAK_CONSTANTS,
  KeycloakConfiguration,
  TextHelperService,
} from '@dcx/ui/libs';
import { of, Subject, throwError } from 'rxjs';

import { GlobalLoaderService } from '../../services/global-loader.service';
import { CustomerLoyaltyService } from '../../services/loyalty/customer-loyalty.service';
import { CustomerAccount, CustomerBalance } from '../../models';
import { AuthButtonComponent } from './auth-button.component';
import { AuthButtonLayout } from './enums/auth-button-layout.enum';
import { AuthButtonData } from './models/auth-button-data.model';
import { AuthButtonConfig } from './models/auth-button.config';

const mockAuthButtonData: AuthButtonData = {
  redirectUrlAfterLogin: { url: '/home' },
  redirectUrlAfterLogout: { url: '/logout' },
  authenticatedAccountMenuConfig: {} as any,
  dialogModalsRepository: {
    modalDialogExceptions: [
      {
        modalDialogSettings: { modalDialogId: 'SessionExpired' },
        modalDialogContent: {
          modalTitle: 'Session Expired',
          modalDescription: 'Your session has expired',
          modalImageSrc: '/assets/expired.svg',
        },
        modalDialogButtonsControl: {
          actionButtonLabel: 'Sign In Again',
        },
      },
    ],
  } as any,
};

const mockAuthButtonConfig: AuthButtonConfig = {
  culture: 'en',
};

const mockAccountDto: AccountV2Models.AccountDto = {
  username: 'john doe',
  firstName: 'John',
  lastName: 'Doe',
  init: () => {},
  toJSON: () => ({}),
  customerPrograms: {
    lifemiles: {
      tier: 'Gold Elite',
      init: () => {},
      toJSON: () => ({}),
    } as any,
  },
  balance: {
    lifemiles: {
      amount: 12500,
    },
  } as any,
};

const mockCustomerAccount: CustomerAccount = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'john doe',
  balance: {
    lifemiles: {
      amount: 12500,
    },
  },
  customerPrograms: {
    lifemiles: {
      programNumber: '',
      tier: 'Gold Elite',
    },
  },
};

const mockCustomerBalance: CustomerBalance = {
  lifemiles: {
    amount: 12500,
  },
};

@Component({
  selector: 'auth-button-host',
  template: `<auth-button [data]="data" [config]="config" [layout]="layout"></auth-button>`,
  standalone: true,
  imports: [AuthButtonComponent],
})
class AuthButtonHostComponent {
  public data: AuthButtonData = mockAuthButtonData;
  public config: AuthButtonConfig = mockAuthButtonConfig;
  public layout: AuthButtonLayout = AuthButtonLayout.DEFAULT;

  @ViewChild(AuthButtonComponent, { static: true })
  public child!: AuthButtonComponent;
}

describe('AuthButtonComponent', () => {
  let fixture: ComponentFixture<AuthButtonHostComponent>;
  let hostComponent: AuthButtonHostComponent;
  let component: AuthButtonComponent;
  let translateServiceStub: jasmine.SpyObj<TranslateService>;
  let authServiceStub: jasmine.SpyObj<AuthService>;
  let accountClientV2Stub: jasmine.SpyObj<AccountV2Client>;
  let accountClientStub: jasmine.SpyObj<AccountClient>;
  let currencyFormatPipeStub: jasmine.SpyObj<CurrencyFormatPipe>;
  let currencyServiceStub: jasmine.SpyObj<CurrencyService>;
  let cultureServiceExStub: jasmine.SpyObj<CultureServiceEx>;
  let textHelperServiceStub: jasmine.SpyObj<TextHelperService>;
  let modalDialogServiceStub: jasmine.SpyObj<ModalDialogService>;
  let globalLoaderServiceStub: jasmine.SpyObj<GlobalLoaderService>;
  let customerLoyaltyServiceStub: jasmine.SpyObj<CustomerLoyaltyService>;

  let isAuthenticatedSubject: Subject<boolean>;
  let keycloakConfigSubject: Subject<KeycloakConfiguration | null>;
  let expiredSessionSubject: Subject<boolean>;
  let forceLogoutSubject: Subject<boolean>;

  beforeEach(async () => {
    isAuthenticatedSubject = new Subject<boolean>();
    keycloakConfigSubject = new Subject<KeycloakConfiguration | null>();
    expiredSessionSubject = new Subject<boolean>();
    forceLogoutSubject = new Subject<boolean>();

    translateServiceStub = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant', 'stream']);
    translateServiceStub.instant.and.callFake((key: string) => key);
    translateServiceStub.stream.and.returnValue(of('Sign In'));

    authServiceStub = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'logout',
      'removeAuthenticationTokenData',
      'isAuthenticatedKeycloak$',
      'keycloakConfig$',
      'expiredSession$',
      'forceLogout$',
    ]);
    authServiceStub.isAuthenticatedKeycloak$.and.returnValue(isAuthenticatedSubject.asObservable());
    authServiceStub.keycloakConfig$.and.returnValue(keycloakConfigSubject.asObservable());
    authServiceStub.expiredSession$.and.returnValue(expiredSessionSubject.asObservable());
    authServiceStub.forceLogout$.and.returnValue(forceLogoutSubject.asObservable());

    accountClientV2Stub = jasmine.createSpyObj<AccountV2Client>('AccountV2Client', ['sessionGET']);
    accountClientV2Stub.sessionGET.and.returnValue(
      of({ result: { data: mockAccountDto } } as any)
    );

    accountClientStub = jasmine.createSpyObj<AccountClient>('AccountClient', ['sessionDELETE']);
    accountClientStub.sessionDELETE.and.returnValue(of(null as any));

    currencyFormatPipeStub = jasmine.createSpyObj<CurrencyFormatPipe>('CurrencyFormatPipe', ['transform']);
    currencyFormatPipeStub.transform.and.returnValue('12,500');

    currencyServiceStub = jasmine.createSpyObj<CurrencyService>('CurrencyService', ['getCurrentCurrency']);
    currencyServiceStub.getCurrentCurrency.and.returnValue('USD');

    cultureServiceExStub = jasmine.createSpyObj<CultureServiceEx>('CultureServiceEx', ['getCulture']);
    cultureServiceExStub.getCulture.and.returnValue('en-US');

    textHelperServiceStub = jasmine.createSpyObj<TextHelperService>('TextHelperService', ['getCapitalizeWords']);
    textHelperServiceStub.getCapitalizeWords.and.callFake((text: string) => 
      text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    );

    modalDialogServiceStub = jasmine.createSpyObj<ModalDialogService>('ModalDialogService', ['openModal']);
    modalDialogServiceStub.openModal.and.returnValue(of('close' as any));

    globalLoaderServiceStub = jasmine.createSpyObj<GlobalLoaderService>('GlobalLoaderService', ['show', 'hide']);

    customerLoyaltyServiceStub = jasmine.createSpyObj<CustomerLoyaltyService>('CustomerLoyaltyService', [
      'getCustomerProgramData',
      'formatLoyaltyBalance',
      'formatLoyaltyPoints',
    ]);
    customerLoyaltyServiceStub.getCustomerProgramData.and.returnValue(
      of({
        tierName: 'Gold',
        loyaltyId: 'LM123456789',
        mainColor: '#FFD700',
        darkerColor: '#DAA520',
      })
    );
    customerLoyaltyServiceStub.formatLoyaltyBalance.and.returnValue('12,500');
    customerLoyaltyServiceStub.formatLoyaltyPoints.and.returnValue('12,500');

    await TestBed.configureTestingModule({
      imports: [AuthButtonHostComponent, HttpClientTestingModule],
      providers: [
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: AccountV2Client, useValue: accountClientV2Stub },
        { provide: AccountClient, useValue: accountClientStub },
        { provide: CurrencyFormatPipe, useValue: currencyFormatPipeStub },
        { provide: CurrencyService, useValue: currencyServiceStub },
        { provide: CultureServiceEx, useValue: cultureServiceExStub },
        { provide: TextHelperService, useValue: textHelperServiceStub },
        { provide: ModalDialogService, useValue: modalDialogServiceStub },
        { provide: GlobalLoaderService, useValue: globalLoaderServiceStub },
        { provide: CustomerLoyaltyService, useValue: customerLoyaltyServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthButtonHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.child;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT);
    fixture.destroy();
  });

  describe('Component initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize on ngOnInit', () => {
      spyOn<any>(component, 'internalInit');
      component.ngOnInit();
      expect(component['internalInit']).toHaveBeenCalledTimes(1);
    });

    it('should set button and dropdown config on initialization', () => {
      expect(component.notLoggedButtonConfig).toBeDefined();
      expect(component.notLoggedButtonConfig.label).toBe('Sign In');
      expect(component.loggedDropdownVMConfig).toBeDefined();
      expect(component.loggedDropdownVMConfig.config.closeOnSelection).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should disconnect resize observer and complete destroy subject', () => {
      const disconnectSpy = jasmine.createSpy('disconnect');
      component['nameResizeObserver'] = { disconnect: disconnectSpy } as any;
      
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy when resize observer is undefined', () => {
      component['nameResizeObserver'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Layout computed signals', () => {
    it('should return true for compact layout when layout input is COMPACT', () => {
      hostComponent.layout = AuthButtonLayout.COMPACT;
      fixture.detectChanges();

      expect(component.isCompactLayout()).toBe(true);
      expect(component.isCondensedLayout()).toBe(false);
      expect(component.isCompactClass).toBe(true);
      expect(component.isCondensedClass).toBe(false);
    });

    it('should return true for condensed layout when layout input is CONDENSED', () => {
      hostComponent.layout = AuthButtonLayout.CONDENSED;
      fixture.detectChanges();

      expect(component.isCondensedLayout()).toBe(true);
      expect(component.isCompactLayout()).toBe(false);
      expect(component.isCondensedClass).toBe(true);
      expect(component.isCompactClass).toBe(false);
    });

    it('should return false for both when layout is DEFAULT', () => {
      hostComponent.layout = AuthButtonLayout.DEFAULT;
      fixture.detectChanges();

      expect(component.isCompactLayout()).toBe(false);
      expect(component.isCondensedLayout()).toBe(false);
    });
  });

  describe('Tier border color', () => {
    it('should return darker tier color for border when available', () => {
      component.tierDarkerColor = '#DAA520';

      expect(component.tierBorderColor).toBe('#DAA520');
    });

    it('should return null for border when darker tier color is not available', () => {
      component.tierDarkerColor = null;

      expect(component.tierBorderColor).toBeNull();
    });
  });

  describe('Authentication flow', () => {
    it('should handle authenticated user', fakeAsync(() => {
      component.ngOnInit();
      isAuthenticatedSubject.next(true);
      tick();

      expect(accountClientV2Stub.sessionGET).toHaveBeenCalled();
      expect(component.isLogged).toBe(true);
      expect(component.isLoaded()).toBe(true);
    }));

    it('should handle unauthenticated user', fakeAsync(() => {
      component.ngOnInit();
      isAuthenticatedSubject.next(false);
      tick();

      expect(authServiceStub.removeAuthenticationTokenData).toHaveBeenCalled();
      expect(component.isLogged).toBe(false);
      expect(component.isLoaded()).toBe(true);
    }));

    it('should handle session GET error', fakeAsync(() => {
      accountClientV2Stub.sessionGET.and.returnValue(throwError(() => new Error('Session error')));
      component.ngOnInit();
      isAuthenticatedSubject.next(true);
      tick();

      expect(component.isLoaded()).toBe(true);
    }));
  });

  describe('Login and logout', () => {
    it('should call authService.login with correct redirect URL', () => {
      spyOn<any>(component, 'buildRedirectUrl').and.returnValue('http://localhost/home');
      component.onClickLogin();

      expect(component['buildRedirectUrl']).toHaveBeenCalledWith('/home');
      expect(authServiceStub.login).toHaveBeenCalledWith('http://localhost/home');
    });

    it('should call logout with correct flow', () => {
      spyOn<any>(component, 'executeBackendLogout').and.callFake((callback: () => void) => callback());
      component.onLogout();

      expect(globalLoaderServiceStub.show).toHaveBeenCalled();
      expect(component['executeBackendLogout']).toHaveBeenCalled();
    });

    it('should execute backend logout successfully', fakeAsync(() => {
      keycloakConfigSubject.next({ logoutRetryAttempts: 2 } as KeycloakConfiguration);
      const callbackSpy = jasmine.createSpy('callback');
      
      component['executeBackendLogout'](callbackSpy);
      tick();

      expect(accountClientStub.sessionDELETE).toHaveBeenCalled();
      expect(callbackSpy).toHaveBeenCalled();
    }));

    it('should handle backend logout error and still execute callback', fakeAsync(() => {
      accountClientStub.sessionDELETE.and.returnValue(throwError(() => new Error('Logout error')));
      const callbackSpy = jasmine.createSpy('callback');

      component['executeBackendLogout'](callbackSpy);
      tick();

      expect(callbackSpy).toHaveBeenCalled();
    }));

    it('should use custom URL for logout when provided', () => {
      spyOn<any>(component, 'executeBackendLogout').and.callFake((callback: () => void) => callback());

      component.onLogout('/custom');

      expect(authServiceStub.logout).toHaveBeenCalledWith(globalThis.location.origin + '/custom');
    });
  });

  describe('Session expired handling', () => {
    it('should show modal and logout after closing when session expires', fakeAsync(() => {
      spyOn(component, 'onLogout');
      component.ngOnInit();
      
      expiredSessionSubject.next(true);
      tick();

      expect(modalDialogServiceStub.openModal).toHaveBeenCalled();
      expect(component.onLogout).toHaveBeenCalled();
    }));

    it('should call onLogout when retry logout flag from localStorage is set', () => {
      spyOn(component, 'onLogout');
      localStorage.setItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT, KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE);
      component['logoutIfSessionExpiredOnReload']();

      expect(component.onLogout).toHaveBeenCalled();
    });

    it('should not call onLogout when retry logout flag from localStorage is not set', () => {
      spyOn(component, 'onLogout');
      localStorage.setItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT, '0');
      component['logoutIfSessionExpiredOnReload']();

      expect(component.onLogout).not.toHaveBeenCalled();
    });
  });

  describe('Force logout', () => {
    it('should logout with current pathname when force logout is triggered', () => {
      spyOn(component, 'onLogout');
      component.ngOnInit();

      forceLogoutSubject.next(true);

      expect(component.onLogout).toHaveBeenCalledWith(globalThis.location.pathname);
    });
  });

  describe('Menu toggle', () => {
    it('should toggle menu open state', () => {
      component.isOpenMenu = false;
      component.onClickToggleMenu();
      expect(component.isOpenMenu).toBe(true);

      component.onClickToggleMenu();
      expect(component.isOpenMenu).toBe(false);
    });
  });

  describe('URL building', () => {
    it('should build redirect URL with provided path', () => {
      const result = component['buildRedirectUrl']('/custom-path');
      expect(result).toContain('/custom-path');
      expect(result).toContain(globalThis.location.origin);
    });

    it('should build redirect URL with fallback when no path provided', () => {
      const result = component['buildRedirectUrl']();
      expect(result).toBe(`${globalThis.location.origin}/en`);
    });
  });

  describe('Name formatting and truncation', () => {
    it('should format name correctly', () => {
      const result = component['formatName']('john doe smith');
      expect(result).toBe('John');
    });

    it('should handle empty name', () => {
      const result = component['formatName']('');
      expect(result).toBe('');
    });

    it('should set name initials from username', () => {
      component['setNameInitials'](mockCustomerAccount);
      expect(component.nameInitials).toBe('John');
    });

    it('should set name initials from firstName when username is empty', () => {
      const data: CustomerAccount = { 
        ...mockCustomerAccount, 
        username: '',
      };

      component['setNameInitials'](data);
      expect(component.nameInitials).toBe('John');
    });

    it('should detect truncation when content overflows', () => {
      const mockElement = document.createElement('span');
      mockElement.textContent = 'Very Long Name That Should Truncate';
      Object.defineProperty(mockElement, 'scrollWidth', { value: 200, writable: true });
      Object.defineProperty(mockElement, 'clientWidth', { value: 100, writable: true });

      Object.defineProperty(component, 'nameElRef', {
        value: { nativeElement: mockElement },
        writable: true,
        configurable: true,
      });

      component['evaluateTruncation']();
      expect(component.isNameTruncated).toBe(true);
    });

    it('should not truncate when content fits', () => {
      const mockElement = document.createElement('span');
      mockElement.textContent = 'Short';
      Object.defineProperty(mockElement, 'scrollWidth', { value: 50, writable: true });
      Object.defineProperty(mockElement, 'clientWidth', { value: 100, writable: true });

      Object.defineProperty(component, 'nameElRef', {
        value: { nativeElement: mockElement },
        writable: true,
        configurable: true,
      });

      component['evaluateTruncation']();
      expect(component.isNameTruncated).toBe(false);
    });

    it('should handle evaluation when name element is undefined', () => {
      Object.defineProperty(component, 'nameElRef', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => component['evaluateTruncation']()).not.toThrow();
    });
  });

  describe('Tooltip interactions', () => {
    beforeEach(() => {
      const mockTooltip = {
        show: jasmine.createSpy('show'),
        hide: jasmine.createSpy('hide'),
      };
      Object.defineProperty(component, 'nameTooltip', {
        value: mockTooltip,
        writable: true,
        configurable: true,
      });
    });

    it('should show tooltip on trigger focus when name is truncated', () => {
      component.isNameTruncated = true;
      component.onTriggerFocus();
      expect(component['nameTooltip']?.show).toHaveBeenCalled();
    });

    it('should hide tooltip on trigger focus when name is not truncated', () => {
      component.isNameTruncated = false;
      component.onTriggerFocus();
      expect(component['nameTooltip']?.hide).toHaveBeenCalled();
    });

    it('should hide tooltip on trigger blur', () => {
      component.onTriggerBlur();
      expect(component['nameTooltip']?.hide).toHaveBeenCalled();
    });

    it('should show tooltip on name mouse enter when truncated', () => {
      spyOn<any>(component, 'evaluateTruncation').and.callFake(() => {
        component.isNameTruncated = true;
      });

      component.onNameMouseEnter();
      expect(component['nameTooltip']?.show).toHaveBeenCalled();
    });

    it('should not show tooltip on name mouse enter when not truncated', () => {
      spyOn<any>(component, 'evaluateTruncation').and.callFake(() => {
        component.isNameTruncated = false;
      });

      component.onNameMouseEnter();
      expect(component['nameTooltip']?.show).not.toHaveBeenCalled();
    });

    it('should hide tooltip on name mouse leave when trigger is not focused', () => {
      component['isTriggerFocused'] = false;
      component.onNameMouseLeave();
      expect(component['nameTooltip']?.hide).toHaveBeenCalled();
    });

    it('should not hide tooltip on name mouse leave when trigger is focused', () => {
      component['isTriggerFocused'] = true;
      const hideSpy = component['nameTooltip']?.hide as jasmine.Spy;
      hideSpy.calls.reset();

      component.onNameMouseLeave();
      expect(hideSpy).not.toHaveBeenCalled();
    });
  });

  describe('Loyalty points and tier', () => {
    it('should set loyalty points model', () => {
      component['setLoyaltyPointsModel'](mockCustomerBalance);
      expect(component.loyaltyPointsModel).toBeDefined();
      expect(component.loyaltyPointsModel.amount).toBe('12,500');
    });

    it('should set tier avatar config from program data', fakeAsync(() => {
      component['setTierAvatarConfig'](mockCustomerAccount);
      tick();
      expect(component.tierAvatarConfig).toBeDefined();
      expect(component.tierAvatarConfig.tierName).toBeTruthy();
    }));

    it('should update tier icon label', () => {
      component.tierAvatarConfig = {
        size: 'small' as any,
        icon: { name: 'lifemiles', ariaAttributes: { ariaLabel: '' } },
      };

      component['updateTierIconLabel']();
      expect(component.tierAvatarConfig.icon.ariaAttributes?.ariaLabel).toBeTruthy();
    });
  });

  describe('Keycloak config subscription', () => {
    it('should store keycloak config when received', () => {
      const config: KeycloakConfiguration = { logoutRetryAttempts: 3 } as any;
      component.ngOnInit();

      keycloakConfigSubject.next(config);

      expect(component['keycloakConfig']).toEqual(config);
    });
  });

  describe('Translation stream', () => {
    it('should update button label when translation changes', fakeAsync(() => {
      translateServiceStub.stream.and.returnValue(of('Iniciar Sesión'));

      component['setButtonConfig']();
      tick();

      expect(component.notLoggedButtonConfig.label).toBe('Iniciar Sesión');
    }));
  });
});
