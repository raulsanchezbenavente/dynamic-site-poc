import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IbeEventRedirectType, LoggerService, RedirectionService, StorageService, TabGuardService } from '@dcx/ui/libs';
import { NavigationGuardService } from './navigation-guard.service';

describe('NavigationGuardService', () => {
  let service: NavigationGuardService;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let loggerServiceMock: jasmine.SpyObj<LoggerService>;
  let redirectionServiceMock: jasmine.SpyObj<RedirectionService>;
  const isDuplicateSignal = signal(false);

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj<StorageService>('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
      'removeSessionStorage',
    ]);

    loggerServiceMock = jasmine.createSpyObj<LoggerService>('LoggerService', ['info', 'warn', 'error']);
    redirectionServiceMock = jasmine.createSpyObj<RedirectionService>('RedirectionService', ['redirect']);

    isDuplicateSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        NavigationGuardService,
        { provide: StorageService, useValue: storageServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: RedirectionService, useValue: redirectionServiceMock },
        {
          provide: TabGuardService,
          useValue: { isDuplicate: isDuplicateSignal },
        },
      ],
    });

    service = TestBed.inject(NavigationGuardService);
  });

  describe('setConfirmationPageAllowed', () => {
    it('should set access flag to true', () => {
      // Act
      service.setConfirmationPageAllowed(true);

      // Assert
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith('allowed_to_be_in_confirmation_page', true);
    });

    it('should set access flag to false when denying access', () => {
      // Act
      service.setConfirmationPageAllowed(false);

      // Assert
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith('allowed_to_be_in_confirmation_page', false);
    });
  });

  describe('isConfirmationPageAllowed', () => {
    it('should return true when access flag is true', () => {
      // Arrange
      storageServiceMock.getSessionStorage.and.callFake((key: string) => {
        if (key === 'allowed_to_be_in_confirmation_page') return true;
        return null;
      });

      // Act
      const result = service.isConfirmationPageAllowed();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when current page matches last allowed page (reload)', () => {
      // Arrange
      storageServiceMock.getSessionStorage.and.returnValue(true);

      // Act
      const result = service.isConfirmationPageAllowed();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when access is not allowed and not a reload', () => {
      // Arrange
      storageServiceMock.getSessionStorage.and.returnValue(null);

      // Act
      const result = service.isConfirmationPageAllowed();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when flag is false and pages do not match', () => {
      // Arrange
      storageServiceMock.getSessionStorage.and.returnValue(false);

      // Act
      const result = service.isConfirmationPageAllowed();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('redirectToHomeAndDeny', () => {
    it('should deny access and redirect to home', () => {
      // Act
      service.denyAccessAndRedirect();

      // Assert
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith('allowed_to_be_in_confirmation_page', false);
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'NavigationGuardService',
        'Denying access and redirecting',
        jasmine.any(Object)
      );
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '/');
    });

    it('should use custom home URL when provided', () => {
      // Act
      service.denyAccessAndRedirect('/en-us/home');

      // Assert
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'NavigationGuardService',
        'Denying access and redirecting',
        jasmine.any(Object)
      );
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(IbeEventRedirectType.internalRedirect, '/en-us/home');
    });

    it('should NOT redirect when TabGuardService flags tab as duplicate', () => {
      // Arrange
      isDuplicateSignal.set(true);

      // Act
      service.denyAccessAndRedirect('/some-url');

      // Assert
      expect(redirectionServiceMock.redirect).not.toHaveBeenCalled();
      expect(storageServiceMock.setSessionStorage).not.toHaveBeenCalled();
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'NavigationGuardService',
        'Skipping redirect — tab already detected as duplicate by TabGuardService',
      );
    });

    it('should redirect normally when TabGuardService does NOT flag tab as duplicate', () => {
      // Arrange
      isDuplicateSignal.set(false);

      // Act
      service.denyAccessAndRedirect('/custom-url');

      // Assert
      expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.internalRedirect,
        '/custom-url',
      );
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith('allowed_to_be_in_confirmation_page', false);
    });
  });
});
