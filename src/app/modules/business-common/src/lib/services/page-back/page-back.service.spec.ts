import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertType,
  EnumStorageKey,
  IbeEventRedirectType,
  NotificationService,
  RedirectionService,
  StorageService,
  WindowHelper,
} from '@dcx/ui/libs';

import { PageBackService } from './page-back.service';
import { PageBackModel } from '../models/page-back.model';

describe('PageBackService', () => {
  let service: PageBackService;
  let storageService: jasmine.SpyObj<StorageService>;
  let redirectService: jasmine.SpyObj<RedirectionService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let translationService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'setSessionStorage',
      'getSessionStorage',
      'removeSessionStorage',
    ]);
    const redirectServiceSpy = jasmine.createSpyObj('RedirectionService', ['redirect']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showNotification']);
    const translationServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        PageBackService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: RedirectionService, useValue: redirectServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: TranslateService, useValue: translationServiceSpy },
      ],
    });

    service = TestBed.inject(PageBackService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    redirectService = TestBed.inject(RedirectionService) as jasmine.SpyObj<RedirectionService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    translationService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveDeniedUrl', () => {
    it('should save the denied page URL to session storage', () => {
      // Arrange
      const currentPath = '/checkout/payment';
      spyOn(WindowHelper, 'getPath').and.returnValue(currentPath);
      const expectedPageBackValue: PageBackModel = {
        deniedPage: currentPath,
        pageBackUrl: '',
      };

      // Act
      service.saveDeniedUrl();

      // Assert
      expect(WindowHelper.getPath).toHaveBeenCalled();
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl, expectedPageBackValue);
    });

    it('should save empty string when WindowHelper.getPath returns null', () => {
      // Arrange
      spyOn(WindowHelper, 'getPath').and.returnValue(null as any);
      const expectedPageBackValue: PageBackModel = {
        deniedPage: '',
        pageBackUrl: '',
      };

      // Act
      service.saveDeniedUrl();

      // Assert
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl, expectedPageBackValue);
    });
  });

  describe('saveRedirectUrl', () => {
    it('should save the redirect URL when page_back-url exists in session storage', () => {
      // Arrange
      const currentPath = '/home';
      const existingPageBackValue: PageBackModel = {
        deniedPage: '/checkout/payment',
        pageBackUrl: '',
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(currentPath);
      storageService.getSessionStorage.and.returnValue(existingPageBackValue);

      // Act
      service.saveRedirectUrl();

      // Assert
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl);
      expect(existingPageBackValue.pageBackUrl).toBe(currentPath);
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl, existingPageBackValue);
    });

    it('should not save anything when page_back-url does not exist in session storage', () => {
      // Arrange
      storageService.getSessionStorage.and.returnValue(null);

      // Act
      service.saveRedirectUrl();

      // Assert
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl);
      expect(storageService.setSessionStorage).not.toHaveBeenCalled();
    });
  });

  describe('getSavedUrl', () => {
    it('should return the saved URL when page_back-url exists', () => {
      // Arrange
      const pageBackValue: PageBackModel = {
        deniedPage: '/checkout/payment',
        pageBackUrl: '/home',
      };
      storageService.getSessionStorage.and.returnValue(pageBackValue);

      // Act
      const result = service.getSavedUrl();

      // Assert
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl);
      expect(result).toBe('/home');
    });

    it('should return null when page_back-url does not exist', () => {
      // Arrange
      storageService.getSessionStorage.and.returnValue(null);

      // Act
      const result = service.getSavedUrl();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getDeniedUrl', () => {
    it('should return the denied page URL when page_back-url exists', () => {
      // Arrange
      const pageBackValue: PageBackModel = {
        deniedPage: '/checkout/payment',
        pageBackUrl: '/home',
      };
      storageService.getSessionStorage.and.returnValue(pageBackValue);

      // Act
      const result = service.getDeniedUrl();

      // Assert
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl);
      expect(result).toBe('/checkout/payment');
    });

    it('should return null when page_back-url does not exist', () => {
      // Arrange
      storageService.getSessionStorage.and.returnValue(null);

      // Act
      const result = service.getDeniedUrl();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('clearSavedUrl', () => {
    it('should remove page_back-url from session storage', () => {
      // Act
      service.clearSavedUrl();

      // Assert
      expect(storageService.removeSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PageBackUrl);
    });
  });

  describe('validatePageBackUrl', () => {
    it('should show popup error when current path matches denied URL', () => {
      // Arrange
      const deniedPath = '/checkout/payment';
      const pageBackValue: PageBackModel = {
        deniedPage: deniedPath,
        pageBackUrl: '/home',
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(deniedPath);
      storageService.getSessionStorage.and.returnValue(pageBackValue);
      translationService.instant.and.returnValues('Error', 'Access Denied', 'OK');

      // Act
      service.validatePageBackUrl();

      // Assert
      expect(WindowHelper.getPath).toHaveBeenCalled();
      expect(notificationService.showNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Error',
          message: 'Access Denied',
          alertType: AlertType.ERROR,
          buttonPrimaryText: 'OK',
        })
      );
    });

    it('should not show popup error when current path does not match denied URL', () => {
      // Arrange
      const currentPath = '/home';
      const deniedPath = '/checkout/payment';
      const pageBackValue: PageBackModel = {
        deniedPage: deniedPath,
        pageBackUrl: '/home',
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(currentPath);
      storageService.getSessionStorage.and.returnValue(pageBackValue);

      // Act
      service.validatePageBackUrl();

      // Assert
      expect(notificationService.showNotification).not.toHaveBeenCalled();
    });

    it('should not show popup error when denied URL is null', () => {
      // Arrange
      spyOn(WindowHelper, 'getPath').and.returnValue('/home');
      storageService.getSessionStorage.and.returnValue(null);

      // Act
      service.validatePageBackUrl();

      // Assert
      expect(notificationService.showNotification).not.toHaveBeenCalled();
    });
  });

  describe('notification callback actions', () => {
    it('should redirect to saved URL when primary button is clicked', () => {
      // Arrange
      const deniedPath = '/checkout/payment';
      const savedPath = '/home';
      const pageBackValue: PageBackModel = {
        deniedPage: deniedPath,
        pageBackUrl: savedPath,
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(deniedPath);
      storageService.getSessionStorage.and.returnValue(pageBackValue);
      translationService.instant.and.returnValues('Error', 'Access Denied', 'OK');

      // Act
      service.validatePageBackUrl();

      // Assert
      const notificationConfig = notificationService.showNotification.calls.mostRecent().args[0];
      expect(notificationConfig.buttonPrimaryCallBack).toBeDefined();

      // Execute the callback
      if (notificationConfig.buttonPrimaryCallBack) {
        notificationConfig.buttonPrimaryCallBack();
      }

      expect(redirectService.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, savedPath);
    });

    it('should redirect to saved URL when onBlurCallback is triggered', () => {
      // Arrange
      const deniedPath = '/checkout/payment';
      const savedPath = '/home';
      const pageBackValue: PageBackModel = {
        deniedPage: deniedPath,
        pageBackUrl: savedPath,
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(deniedPath);
      storageService.getSessionStorage.and.returnValue(pageBackValue);
      translationService.instant.and.returnValues('Error', 'Access Denied', 'OK');

      // Act
      service.validatePageBackUrl();

      // Assert
      const notificationConfig = notificationService.showNotification.calls.mostRecent().args[0];
      expect(notificationConfig.onBlurCallback).toBeDefined();

      // Execute the callback
      if (notificationConfig.onBlurCallback) {
        notificationConfig.onBlurCallback();
      }

      expect(redirectService.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, savedPath);
    });

    it('should redirect to empty string when saved URL is null', () => {
      // Arrange
      const deniedPath = '/checkout/payment';
      const pageBackValue: PageBackModel = {
        deniedPage: deniedPath,
        pageBackUrl: '',
      };
      spyOn(WindowHelper, 'getPath').and.returnValue(deniedPath);
      storageService.getSessionStorage.and.returnValue(pageBackValue);
      translationService.instant.and.returnValues('Error', 'Access Denied', 'OK');

      // Act
      service.validatePageBackUrl();

      // Assert
      const notificationConfig = notificationService.showNotification.calls.mostRecent().args[0];

      // Execute the callback
      if (notificationConfig.buttonPrimaryCallBack) {
        notificationConfig.buttonPrimaryCallBack();
      }

      expect(redirectService.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '');
    });
  });
});
