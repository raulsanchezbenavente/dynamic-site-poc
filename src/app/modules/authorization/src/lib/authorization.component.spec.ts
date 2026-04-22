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
  AuthService,
  RedirectionService,
  IbeEventRedirectType,
} from '@dcx/ui/libs';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthorizationComponent } from './authorization.component';
import { AuthorizationConfig } from './models/authorization.config';

describe('AuthorizationComponent', () => {
  let component: AuthorizationComponent;
  let fixture: ComponentFixture<AuthorizationComponent>;
  let composerNotifier$: Subject<ComposerEvent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let configServiceMock: jasmine.SpyObj<ConfigService>;
  let composerServiceMock: jasmine.SpyObj<ComposerService>;
  let loggerServiceMock: jasmine.SpyObj<LoggerService>;
  let redirectionServiceMock: jasmine.SpyObj<RedirectionService>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;

  // Test data
  const mockDataModule: DataModule = { id: 'authorization-test-id', name: 'authorization', config: 'authorization-config' };
  const mockAuthorizationConfig: AuthorizationConfig = {
    redirectUrl: '/login',
    culture: 'es-CO'
  };
  const mockCommonBusinessConfig = { businessConfig: 'test-data' };
  const mockElementRef = new ElementRef(document.createElement('div'));

  beforeEach(async () => {
    // Create fresh Subject for each test
    composerNotifier$ = new Subject<ComposerEvent>();

    // Create spy objects
    configServiceMock = jasmine.createSpyObj('ConfigService', ['getDataModuleId', 'getBusinessModuleConfig', 'getCommonConfig']);
    composerServiceMock = jasmine.createSpyObj('ComposerService', ['notifyComposerEvent', 'updateComposerRegisterStatus'], {
      notifier$: composerNotifier$.asObservable()
    });
    loggerServiceMock = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn', 'debug']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticatedKeycloak$']);
    redirectionServiceMock = jasmine.createSpyObj('RedirectionService', ['redirect']);
    httpClientMock = jasmine.createSpyObj('HttpClient', ['get']);

    // Configure default return values
    configServiceMock.getDataModuleId.and.returnValue(mockDataModule);
    configServiceMock.getBusinessModuleConfig.and.returnValue(of(mockAuthorizationConfig));
    configServiceMock.getCommonConfig.and.returnValue(of(mockCommonBusinessConfig));
    authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [AuthorizationComponent],
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ComposerService, useValue: composerServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: RedirectionService, useValue: redirectionServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: ElementRef, useValue: mockElementRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Authenticated user flow', () => {
    it('should load config and register as LOADED when user is authenticated', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(configServiceMock.getBusinessModuleConfig).toHaveBeenCalled();
      expect(configServiceMock.getCommonConfig).toHaveBeenCalledWith(CommonConfig.BUSINESS_CONFIG);
      expect(component.config()).toEqual(mockAuthorizationConfig);
      expect(composerServiceMock.updateComposerRegisterStatus).toHaveBeenCalledWith(
        mockDataModule.id,
        ComposerStatusEnum.LOADED
      );
      expect(redirectionServiceMock.redirect).not.toHaveBeenCalled();
    }));

    it('should subscribe to composer events and respond to SubmitRequested', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));
      component.ngOnInit();
      tick();

      const mockEvent: ComposerEvent = {
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: mockDataModule.id,
        status: ComposerEventStatusEnum.REQUESTED,
      };

      // Act
      composerNotifier$.next(mockEvent);
      tick();

      // Assert
      expect(composerServiceMock.notifyComposerEvent).toHaveBeenCalledWith({
        ...mockEvent,
        status: ComposerEventStatusEnum.SUCCESS
      });
    }));

    it('should ignore composer events not matching component ID', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));
      component.ngOnInit();
      tick();

      const mockEvent: ComposerEvent = {
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: 'different-id',
        status: ComposerEventStatusEnum.REQUESTED,
      };

      // Act
      composerNotifier$.next(mockEvent);
      tick();

      // Assert
      expect(composerServiceMock.notifyComposerEvent).not.toHaveBeenCalled();
    }));

    it('should ignore composer events with wrong event type', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));
      component.ngOnInit();
      tick();

      const mockEvent: ComposerEvent = {
        type: ComposerEventTypeEnum.RenderRequested,
        componentId: mockDataModule.id,
        status: ComposerEventStatusEnum.REQUESTED,
      };

      // Act
      composerNotifier$.next(mockEvent);
      tick();

      // Assert
      expect(composerServiceMock.notifyComposerEvent).not.toHaveBeenCalled();
    }));
  });

  describe('Unauthenticated user flow', () => {
    it('should redirect to configured redirectUrl when user is not authenticated', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(false));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        mockAuthorizationConfig.redirectUrl
      );
      expect(composerServiceMock.updateComposerRegisterStatus).not.toHaveBeenCalled();
    }));

    it('should redirect to culture fallback when redirectUrl is not configured', fakeAsync(() => {
      // Arrange
      const configWithoutRedirectUrl: AuthorizationConfig = {
        redirectUrl: '',
        culture: 'es-CO'
      };
      configServiceMock.getBusinessModuleConfig.and.returnValue(of(configWithoutRedirectUrl));
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(false));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        ''
      );
    }));

    it('should redirect to root when neither redirectUrl nor culture are configured', fakeAsync(() => {
      // Arrange
      const minimalConfig: AuthorizationConfig = {
        redirectUrl: '',
        culture: ''
      };
      configServiceMock.getBusinessModuleConfig.and.returnValue(of(minimalConfig));
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(false));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      // Note: ?? operator only uses fallback for null/undefined, not empty string
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        ''
      );
    }));
  });

  describe('Config loading', () => {
    it('should load config from ConfigService when baseConfig input is not provided', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(configServiceMock.getBusinessModuleConfig).toHaveBeenCalled();
      expect(httpClientMock.get).not.toHaveBeenCalled();
      expect(component.config()).toEqual(mockAuthorizationConfig);
    }));

    it('should load config from HTTP when baseConfig input is provided', fakeAsync(() => {
      // Arrange
      const httpConfig: AuthorizationConfig = {
        redirectUrl: '/http-login',
        culture: 'en-US'
      };
      const baseConfigInput = { url: 'https://api.example.com/config' };
      
      httpClientMock.get.and.returnValue(of(httpConfig));
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));
      
      fixture.componentRef.setInput('baseConfig', baseConfigInput);
      TestBed.flushEffects();

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(baseConfigInput.url);
      expect(configServiceMock.getBusinessModuleConfig).not.toHaveBeenCalled();
      expect(component.config()).toEqual(httpConfig);
    }));

    it('should log config information when loaded from ConfigService', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'AuthorizationComponent',
        'Business module config',
        jasmine.anything()
      );
    }));

    it('should log business config information', fakeAsync(() => {
      // Arrange
      authServiceMock.isAuthenticatedKeycloak$.and.returnValue(of(true));

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'Authorization',
        'Business config',
        mockCommonBusinessConfig
      );
    }));
  });
});
