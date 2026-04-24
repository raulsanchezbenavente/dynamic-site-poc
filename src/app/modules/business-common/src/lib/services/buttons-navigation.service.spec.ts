import { TestBed } from '@angular/core/testing';
import { EnumStorageKey, LoggerService, StorageService } from '@dcx/ui/libs';

import { ButtonsNavigationService } from './buttons-navigation.service';
import { NavigationHistory } from './models/navigation-history.model';

describe('ButtonsNavigationService', () => {
  let service: ButtonsNavigationService;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let loggerServiceMock: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
      'removeSessionStorage',
    ]);
    loggerServiceMock = jasmine.createSpyObj('LoggerService', ['info']);

    // Default: no previous navigation history
    storageServiceMock.getSessionStorage.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        ButtonsNavigationService,
        { provide: StorageService, useValue: storageServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    });

    service = TestBed.inject(ButtonsNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setNavigationHistory', () => {
    it('should save navigation history to storage', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/en/home',
        },
      };

      service.setNavigationHistory(history);

      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.NavigationHistory, history);
    });

    it('should update the originUrl signal after setting history', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Confirmation',
          url: '/es/confirmation/ABC123',
        },
      };

      service.setNavigationHistory(history);

      expect(service.originUrl()).toBe('/es/confirmation/ABC123');
    });

    it('should log the navigation history set action', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);

      expect(loggerServiceMock.info).toHaveBeenCalledWith('ButtonsNavigationService', 'Navigation history set', history);
    });
  });

  describe('getRedirectOverrideUrl', () => {
    it('should return null when no navigation history exists', () => {
      const result = service.getRedirectOverrideUrl('/current/path');

      expect(result).toBeNull();
    });

    it('should return null when current path matches origin url (prevent loop)', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);
      const result = service.getRedirectOverrideUrl('/home');

      expect(result).toBeNull();
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        'ButtonsNavigationService',
        'Skipping redirect override - current page matches origin',
        jasmine.objectContaining({
          currentPath: '/home',
          overrideUrl: '/home',
        })
      );
    });

    it('should return origin url when current path is different', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);
      const result = service.getRedirectOverrideUrl('/manage-check-in');

      expect(result).toBe('/home');
    });

    it('should return null when navigation history exists but has no origin page url', () => {
      // Simulate corrupted or incomplete data
      storageServiceMock.getSessionStorage.and.returnValue({ originPage: {} } as NavigationHistory);
      service = TestBed.inject(ButtonsNavigationService);

      const result = service.getRedirectOverrideUrl('/current/path');

      expect(result).toBeNull();
    });
  });

  describe('clearNavigationHistory', () => {
    it('should remove navigation history from session storage', () => {
      service.clearNavigationHistory();

      expect(storageServiceMock.removeSessionStorage).toHaveBeenCalledWith(EnumStorageKey.NavigationHistory);
    });

    it('should set navigationHistory signal to null', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);
      expect(service.originUrl()).not.toBeNull();

      service.clearNavigationHistory();

      expect(service.originUrl()).toBeNull();
    });

    it('should log the clear action', () => {
      service.clearNavigationHistory();

      expect(loggerServiceMock.info).toHaveBeenCalledWith('ButtonsNavigationService', 'Navigation history cleared');
    });
  });

  describe('originUrl computed signal', () => {
    it('should return null when no navigation history exists', () => {
      expect(service.originUrl()).toBeNull();
    });

    it('should return the origin url when navigation history exists', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);

      expect(service.originUrl()).toBe('/home');
    });

    it('should return null after clearing navigation history', () => {
      const history: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };

      service.setNavigationHistory(history);
      expect(service.originUrl()).not.toBeNull();

      service.clearNavigationHistory();

      expect(service.originUrl()).toBeNull();
    });
  });

  describe('loadFromStorage on initialization', () => {
    it('should load existing navigation history from storage on service creation', () => {
      const existingHistory: NavigationHistory = {
        originPage: {
          name: 'Home',
          url: '/home',
        },
      };
      TestBed.resetTestingModule();
      storageServiceMock.getSessionStorage.and.returnValue(existingHistory);

      TestBed.configureTestingModule({
        providers: [
          ButtonsNavigationService,
          { provide: StorageService, useValue: storageServiceMock },
          { provide: LoggerService, useValue: loggerServiceMock },
        ],
      });

      // Create a new instance to test initialization
      const newService = TestBed.inject(ButtonsNavigationService);

      expect(newService.originUrl()).toBe('/home');
    });

    it('should have null originUrl when no history exists in storage on initialization', () => {
      storageServiceMock.getSessionStorage.and.returnValue(null);

      const newService = TestBed.inject(ButtonsNavigationService);

      expect(newService.originUrl()).toBeNull();
    });
  });

  describe('normalizeCultureInUrl', () => {
    const testCases = [
      {
        description: 'should remove supported culture code (es) from URL',
        input: '/uiplus/es/check-in/home/',
        expected: '/uiplus/check-in/home/',
      },
      {
        description: 'should remove supported culture code (en) from URL',
        input: '/uiplus/en/check-in/home/',
        expected: '/uiplus/check-in/home/',
      },
      {
        description: 'should remove supported culture code (pt) from URL',
        input: '/uiplus/pt/booking/',
        expected: '/uiplus/booking/',
      },
      {
        description: 'should remove supported culture code (fr) from URL',
        input: '/uiplus/fr/confirmation/',
        expected: '/uiplus/confirmation/',
      },
      {
        description: 'should remove culture code regardless of position in URL',
        input: '/uiplus/something/es/check-in/',
        expected: '/uiplus/something/check-in/',
      },
      {
        description: 'should not remove unsupported culture codes (et)',
        input: '/uiplus/et/check-in/home/',
        expected: '/uiplus/et/check-in/home/',
      },
      {
        description: 'should not remove two-letter codes that are not cultures (ab)',
        input: '/uiplus/ab/check-in/home/',
        expected: '/uiplus/ab/check-in/home/',
      },
      {
        description: 'should handle URL without culture code',
        input: '/uiplus/check-in/home/',
        expected: '/uiplus/check-in/home/',
      },
      {
        description: 'should be case insensitive when matching culture codes (ES)',
        input: '/uiplus/ES/check-in/home/',
        expected: '/uiplus/check-in/home/',
      },
      {
        description: 'should handle URLs with multiple segments',
        input: '/uiplus/en/check-in/confirmation/ABC123/',
        expected: '/uiplus/check-in/confirmation/ABC123/',
      },
      {
        description: 'should remove culture code even without trailing slash at the end',
        input: '/uiplus/es/check-in',
        expected: '/uiplus/check-in',
      },
      {
        description: 'should only remove first occurrence of culture code',
        input: '/uiplus/es/section/es/',
        expected: '/uiplus/section/es/',
      },
      {
        description: 'should not remove culture code if not a complete segment',
        input: '/uiplus/reservation/home/',
        expected: '/uiplus/reservation/home/',
      },
      {
        description: 'should handle empty string',
        input: '',
        expected: '',
      },
    ];

    testCases.forEach(({ description, input, expected }) => {
      it(description, () => {
        const result = (service as any).normalizeCultureInUrl(input);
        expect(result).toBe(expected);
      });
    });
  });
});