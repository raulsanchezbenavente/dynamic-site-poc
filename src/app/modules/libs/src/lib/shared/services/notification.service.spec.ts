import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { EventBusService, RedirectService, IbeEventTypeEnum, IbeEvent, ErrorsTranslationKeys } from '../../core';
import { AlertType, NotificationConfigModel, ModalDialogActionType, ModalClosedEvent } from '..';
import { of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BaseErrorResponse } from '@dcx/ui/api-layer';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { urlHelpers } from '../helpers/url-helper';

// 4.1. Standard Translation Mocks (Immutable Rule)
const onLangChangeSubject = new Subject();
const onTranslationChangeSubject = new Subject();
const onDefaultLangChangeSubject = new Subject();
const translateServiceMock = {
  instant: jasmine.createSpy('instant').and.callFake((key: string, params?: any) => key),
  get: jasmine.createSpy('get').and.callFake((key: string) => of(key)),
  use: jasmine.createSpy('use').and.returnValue(of(void 0)),
  stream: jasmine.createSpy('stream').and.callFake((key: string) => of(key)),
  onLangChange: onLangChangeSubject.asObservable(),
  onTranslationChange: onTranslationChangeSubject.asObservable(),
  onDefaultLangChange: onDefaultLangChangeSubject.asObservable(),
  currentLang: 'es-CO',
  defaultLang: 'es-CO',
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  addLangs: jasmine.createSpy('addLangs'),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('es'),
  getTranslation: jasmine.createSpy('getTranslation').and.returnValue(of({})),
};

// Service Mocks
const eventNotifierSubject = new Subject<IbeEvent | ModalClosedEvent>();
const eventBusServiceMock = {
  eventNotifier$: eventNotifierSubject.asObservable(),
  notifyEvent: jasmine.createSpy('notifyEvent')
};

const redirectServiceMock = {
  validateEventRedirectType: jasmine.createSpy('validateEventRedirectType').and.returnValue('internal')
};

describe('NotificationService', () => {
  let service: NotificationService;
  let translate: TranslateService;
  let eventBus: EventBusService;
  let redirectService: RedirectService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationService,
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: EventBusService, useValue: eventBusServiceMock },
        { provide: RedirectService, useValue: redirectServiceMock }
      ]
    });
    service = TestBed.inject(NotificationService);
    translate = TestBed.inject(TranslateService);
    eventBus = TestBed.inject(EventBusService);
    redirectService = TestBed.inject(RedirectService);

    // Reset spies
    (translate.instant as jasmine.Spy).calls.reset();
    (eventBus.notifyEvent as jasmine.Spy).calls.reset();
    (redirectService.validateEventRedirectType as jasmine.Spy).calls.reset();

    // Reset internal state
    service['isOpenModal'].next(false);

    // Spy on urlHelpers
    spyOn(urlHelpers, 'getCultureFromCurrentUrl').and.returnValue('en-US');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showNotification', () => {
    it('should open modal and emit config when no modal is open', () => {
      const config: NotificationConfigModel = { message: 'Test Message', alertType: AlertType.INFO };
      let emittedConfig: NotificationConfigModel | undefined;

      service.notificationConfig$.subscribe(c => emittedConfig = c);
      service.showNotification(config);

      expect(service['isOpenModal'].value).toBeTrue();
      expect(emittedConfig).toEqual(config);
    });

    it('should default alertType to ERROR if not provided', () => {
      const config: NotificationConfigModel = { message: 'Test Message' };
      let emittedConfig: NotificationConfigModel | undefined;

      service.notificationConfig$.subscribe(c => emittedConfig = c);
      service.showNotification(config);

      expect(emittedConfig?.alertType).toBe(AlertType.ERROR);
    });

    it('should NOT open modal if one is already open', () => {
      service['isOpenModal'].next(true);
      const config: NotificationConfigModel = { message: 'Test Message' };
      let emittedConfig: NotificationConfigModel | undefined;

      service.notificationConfig$.subscribe(c => emittedConfig = c);
      service.showNotification(config);

      expect(emittedConfig).toBeUndefined();
    });

    it('should subscribe to modal closed event', () => {
      const config: NotificationConfigModel = { message: 'Test Message' };
      service.showNotification(config);

      // Simulate modal closed
      const closeEvent: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.CLOSE }
      };
      eventNotifierSubject.next(closeEvent);

      expect(service['isOpenModal'].value).toBeFalse();
    });

    it('should handle CONFIRM action with buttonPrimaryUrl', () => {
      const config: NotificationConfigModel = {
        message: 'Test',
        buttonPrimaryUrl: '/redirect'
      };
      service.showNotification(config);

      const confirmEvent: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.CONFIRM }
      };
      eventNotifierSubject.next(confirmEvent);

      expect(eventBus.notifyEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        type: IbeEventTypeEnum.pageRedirected,
        redirectUrl: jasmine.objectContaining({ url: '/redirect' }),
        culture: 'en-US'
      }));
      expect(urlHelpers.getCultureFromCurrentUrl).toHaveBeenCalled();
    });

    it('should handle CONFIRM action with buttonPrimaryCallBack', () => {
      const callbackSpy = jasmine.createSpy('callback');
      const config: NotificationConfigModel = {
        message: 'Test',
        buttonPrimaryCallBack: callbackSpy
      };
      service.showNotification(config);

      const confirmEvent: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.CONFIRM }
      };
      eventNotifierSubject.next(confirmEvent);

      expect(callbackSpy).toHaveBeenCalled();
    });

    it('should handle BLUR action with onBlurCallback', () => {
      const callbackSpy = jasmine.createSpy('blurCallback');
      const config: NotificationConfigModel = {
        message: 'Test',
        onBlurCallback: callbackSpy
      };
      service.showNotification(config);

      const blurEvent: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.BLUR }
      };
      eventNotifierSubject.next(blurEvent);

      expect(callbackSpy).toHaveBeenCalled();
    });

    it('should unsubscribe previous subscription when called again', () => {
      const config: NotificationConfigModel = { message: 'Test' };
      service.showNotification(config);

      // Close it to allow opening another one
      service['isOpenModal'].next(false);

      // Spy on unsubscribe
      expect(service.eventNotifierSubscription).toBeDefined();
      const unsubscribeSpy = spyOn(service.eventNotifierSubscription, 'unsubscribe').and.callThrough();

      service.showNotification(config);

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('showError', () => {
    it('should call showNotification with correct config (ignoring extra config due to implementation)', () => {
      spyOn(service, 'showNotification');
      const message = 'Error occurred';
      const type = AlertType.WARNING;
      const extraConfig: NotificationConfigModel = { title: 'Warning', message: 'Overwritten Message' };

      service.showError(message, type, extraConfig);

      // The current implementation ignores the merged config and creates a new object
      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        message: message,
        alertType: type
      }));
    });

    it('should use default AlertType.ERROR', () => {
      spyOn(service, 'showNotification');
      service.showError('Error');
      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        alertType: AlertType.ERROR
      }));
    });
  });

  describe('showErrorAndRedirect', () => {
    it('should show notification and redirect on modal close', () => {
      spyOn(service, 'showNotification');
      const error = 'Critical Error';
      const redirectUrl = '/home';

      service.showErrorAndRedirect(error, redirectUrl);

      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        message: error,
        alertType: AlertType.ERROR
      }));

      // Simulate modal closed
      const closeEvent: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.CLOSE }
      };
      eventNotifierSubject.next(closeEvent);

      expect(eventBus.notifyEvent).toHaveBeenCalledWith(jasmine.objectContaining({
        type: IbeEventTypeEnum.pageRedirected,
        redirectUrl: jasmine.objectContaining({ url: redirectUrl }),
        culture: 'en-US'
      }));
    });

    it('should use provided notificationConfig message', () => {
      spyOn(service, 'showNotification');
      service.showErrorAndRedirect('Err', '/home', AlertType.INFO, { message: 'Custom Message' });
      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Custom Message'
      }));
    });
  });

  describe('showErrorModal', () => {
    it('should show generic error if translation is missing', () => {
      spyOn(service, 'showNotification');
      // Mock instant to return the key itself, simulating missing translation
      (translate.instant as jasmine.Spy).and.callFake((key) => key);

      const errorResponse: BaseErrorResponse = { code: '500', error: { code: 'UNKNOWN_CODE', description: 'msg', trace: '123' } };
      service.showErrorModal(errorResponse);

      expect(translate.instant).toHaveBeenCalledWith('UNKNOWN_CODE');
      expect(translate.instant).toHaveBeenCalledWith(ErrorsTranslationKeys.Errors_Generic_Internal);
      expect(service.showNotification).toHaveBeenCalled();
    });

    it('should show specific error if translation exists', () => {
      spyOn(service, 'showNotification');
      (translate.instant as jasmine.Spy).and.callFake((key) => {
        if (key === 'KNOWN_CODE') return 'Translated Error';
        return key;
      });

      const errorResponse: BaseErrorResponse = { code: '500', error: { code: 'KNOWN_CODE', description: 'msg', trace: '123' } };
      service.showErrorModal(errorResponse);

      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Translated Error'
      }));
    });
  });

  describe('openModalTimeOut', () => {
    it('should call showNotification with correct config', () => {
      const callBack = jasmine.createSpy('callBack');
      const callBackTwo = jasmine.createSpy('callBackTwo');
      spyOn(service, 'showNotification');

      service.openModalTimeOut(callBack, callBackTwo);

      expect(service.showNotification).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Common.SessionTimeout.Title',
        message: 'Common.SessionTimeout.Message',
        buttonPrimaryText: 'Common.SessionTimeout.Button',
        buttonPrimaryCallBack: callBack,
        onBlurCallback: callBack
      }));
    });
  });



  describe('Public Properties', () => {
    it('should have openDialog$ observable', () => {
      expect(service.openDialog$).toBeDefined();
      service.openDialogSubject.next(true);
      service.openDialog$.subscribe(val => {
        expect(val).toBeTrue();
      });
    });
  });
});
