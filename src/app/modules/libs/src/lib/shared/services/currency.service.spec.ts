import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { EventBusService, IbeEventTypeEnum } from '../../core';
import { SessionSettingsResponse } from '../api-models';
import { EnumStorageKey } from '../enums';

import { CurrencyService } from './currency.service';
import { StorageService } from './storage.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockEventBusService: jasmine.SpyObj<EventBusService>;
  let eventNotifierSubject: BehaviorSubject<any>;

  const mockSessionSettingsResponse: SessionSettingsResponse = {
    success: true,
    response: {
      search: {
        origin: 'JFK',
        destination: 'LAX',
        pax: { ADT: 1, CHD: 0, INF: 0, TNG: 0 },
        tripType: 'RT'
      },
      currency: {
        value: 'EUR'
      },
      countryCode: 'US',
      source: 'web'
    }
  };

  beforeEach(() => {
    eventNotifierSubject = new BehaviorSubject<any>(null);

    mockStorageService = jasmine.createSpyObj('StorageService', [
      'setLocalStorage',
      'getLocalStorage',
      'setSessionStorage',
      'getSessionStorage'
    ]);

    mockEventBusService = jasmine.createSpyObj('EventBusService', [], {
      eventNotifier$: eventNotifierSubject.asObservable()
    });

    // Default spy returns
    mockStorageService.getLocalStorage.and.callFake((key: string) => {
      if (key === EnumStorageKey.Currency) return '';
      if (key === EnumStorageKey.CurrencyWasSelectedByUser) return false;
      return '';
    });

    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: EventBusService, useValue: mockEventBusService }
      ]
    });

    service = TestBed.inject(CurrencyService);
  });

  describe('constructor', () => {
    it('should create service instance successfully', () => {
      const freshService = new CurrencyService(mockStorageService, mockEventBusService);
      
      expect(freshService).toBeTruthy();
    });

    it('should initialize currency$ observable', () => {
      expect(service.currency$).toBeDefined();
    });

    it('should load default currency when no stored currency exists', () => {
      expect(service.getCurrentCurrency()).toBe('COP');
    });

    it('should retrieve user selection flag from storage during initialization', () => {
      mockStorageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Currency) return '';
        if (key === EnumStorageKey.CurrencyWasSelectedByUser) return true;
        return '';
      });
      
      TestBed.inject(CurrencyService);
      
      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser);
    });
  });

  describe('setCurrency', () => {
    it('should set currency and update observable', (done) => {
      const testCurrency = 'EUR';
      const isSelectedByUser = true;

      service.setCurrency(testCurrency, isSelectedByUser);

      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.Currency, 'EUR');
      expect(mockStorageService.setLocalStorage).toHaveBeenCalledWith(EnumStorageKey.Currency, 'EUR');
      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, true);
      expect(mockStorageService.setLocalStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, true);
      
      service.currency$.subscribe(currency => {
        expect(currency).toBe(testCurrency);
        done();
      });
    });

    it('should not set currency when selectedCurrency is empty', () => {
      service.setCurrency('', true);

      expect(mockStorageService.setLocalStorage).not.toHaveBeenCalled();
      expect(mockStorageService.setSessionStorage).not.toHaveBeenCalled();
    });

    it('should track when currency was selected by user', () => {
      service.setCurrency('COP', true);

      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, true);
      expect(mockStorageService.setLocalStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, true);
    });

    it('should track when currency was not selected by user', () => {
      service.setCurrency('COP', false);

      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, false);
      expect(mockStorageService.setLocalStorage).toHaveBeenCalledWith(EnumStorageKey.CurrencyWasSelectedByUser, false);
    });

    it('should not set unsupported currency', () => {
      service.setCurrency('INVALID', true);

      expect(mockStorageService.setLocalStorage).not.toHaveBeenCalled();
      expect(mockStorageService.setSessionStorage).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentCurrency', () => {
    it('should return current currency from subject', () => {
      service.setCurrency('GBP', false);
      
      expect(service.getCurrentCurrency()).toBe('GBP');
    });
  });

  describe('getCurrencyFromSessionStorage', () => {
    it('should get currency from session storage', () => {
      mockStorageService.getSessionStorage.and.returnValue('EUR');

      const result = (service as any).getCurrencyFromSessionStorage();

      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.Currency);
      expect(result).toBe('EUR');
    });

    it('should return empty string when no data in session storage', () => {
      mockStorageService.getSessionStorage.and.returnValue('');

      const result = (service as any).getCurrencyFromSessionStorage();

      expect(result).toBe('');
    });
  });

  describe('setCurrencyToStorage', () => {
    it('should set currency to both session and local storage', () => {
      (service as any).setCurrencyToStorage('EUR');

      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.Currency, 'EUR');
      expect(mockStorageService.setLocalStorage).toHaveBeenCalledWith(EnumStorageKey.Currency, 'EUR');
    });
  });

  describe('getCurrencyByPriority', () => {
    it('should prioritize session storage over local storage', () => {
      mockStorageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Currency) return 'EUR';
        return '';
      });
      mockStorageService.getLocalStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Currency) return 'USD';
        return '';
      });

      const result = (service as any).getCurrencyByPriority();

      expect(result).toBe('EUR');
    });

    it('should fall back to local storage when session storage is empty', () => {
      mockStorageService.getSessionStorage.and.returnValue('');
      mockStorageService.getLocalStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Currency) return 'USD';
        return '';
      });

      const result = (service as any).getCurrencyByPriority();

      expect(result).toBe('USD');
    });

    it('should use default currency when both storages are empty', () => {
      mockStorageService.getSessionStorage.and.returnValue('');
      mockStorageService.getLocalStorage.and.returnValue('');

      const result = (service as any).getCurrencyByPriority();

      expect(result).toBe('COP');
    });
  });

  describe('currency$ (observable)', () => {
    it('should emit currency changes through currency$ observable', () => {
      const currencyValues: (string | null)[] = [];
      
      service.currency$.subscribe(currency => {
        currencyValues.push(currency);
      });

      service.setCurrency('EUR', true);
      service.setCurrency('GBP', true);

      expect(currencyValues).toContain('EUR');
      expect(currencyValues).toContain('GBP');
    });

    it('should be a BehaviorSubject that emits current value to new subscribers', () => {
      service.setCurrency('COP', true);

      service.currency$.subscribe(currency => {
        expect(currency).toBe('COP');
      });
    });
  });

  describe('handleSessionSettingsResponse (event handler)', () => {
    beforeEach(() => {
      spyOn(service, 'setCurrency');
    });

    it('should set currency from session settings when user has not selected currency', () => {
      eventNotifierSubject.next({
        type: IbeEventTypeEnum.sessionSettingsResponse,
        payload: mockSessionSettingsResponse
      });

      expect(service.setCurrency).toHaveBeenCalledWith('EUR', false);
    });

    it('should not set currency from session when user has already selected currency', () => {
      (service as any).currencySelectedByUser = true;

      eventNotifierSubject.next({
        type: IbeEventTypeEnum.sessionSettingsResponse,
        payload: mockSessionSettingsResponse
      });

      expect(service.setCurrency).not.toHaveBeenCalled();
    });

    it('should not set unsupported currency from session settings', () => {
      const sessionResponseWithUnsupportedCurrency: SessionSettingsResponse = {
        ...mockSessionSettingsResponse,
        response: {
          ...mockSessionSettingsResponse.response,
          currency: { value: 'XYZ' }
        }
      };
      
      eventNotifierSubject.next({
        type: IbeEventTypeEnum.sessionSettingsResponse,
        payload: sessionResponseWithUnsupportedCurrency
      });

      expect(service.setCurrency).not.toHaveBeenCalled();
    });

    it('should ignore non-session-settings events', () => {
      eventNotifierSubject.next({
        type: 'OTHER_EVENT_TYPE',
        payload: mockSessionSettingsResponse
      });

      expect(service.setCurrency).not.toHaveBeenCalled();
    });

    it('should handle session settings response with missing currency', () => {
      const sessionResponseWithoutCurrency: SessionSettingsResponse = {
        ...mockSessionSettingsResponse,
        response: {
          ...mockSessionSettingsResponse.response,
          currency: { value: '' }
        }
      };
      
      eventNotifierSubject.next({
        type: IbeEventTypeEnum.sessionSettingsResponse,
        payload: sessionResponseWithoutCurrency
      });

      expect(service.setCurrency).not.toHaveBeenCalled();
    });

    it('should correctly identify and accept supported currencies', () => {
      eventNotifierSubject.next({
        type: IbeEventTypeEnum.sessionSettingsResponse,
        payload: {
          ...mockSessionSettingsResponse,
          response: {
            ...mockSessionSettingsResponse.response,
            currency: { value: 'USD' }
          }
        }
      });

      expect(service.setCurrency).toHaveBeenCalledWith('USD', false);
    });
  });
});
