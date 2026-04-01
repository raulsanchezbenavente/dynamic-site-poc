import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { EventBusService } from '../../core/lib/event-bus.service';
import {
  CurrencyService,
  PointOfSale,
  PointOfSaleStored,
  SessionSettingsResponse,
  SessionSettingsService,
  urlHelpers,
} from '../../shared';
import { EnumStorageKey } from '../enums/enum-storage-keys';

import { PointOfSaleService } from './point-of-sale.service';
import { StorageService } from './storage.service';

describe('PointOfSaleService', () => {
  let service: PointOfSaleService;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockEventBusService: jasmine.SpyObj<EventBusService>;
  let mockSessionSettingsService: jasmine.SpyObj<SessionSettingsService>;
  let mockLocation: jasmine.SpyObj<Location>;

  const mockPointOfSale1: PointOfSale = {
    name: 'Colombia',
    stationCode: 'BOG',
    code: 'CO',
    default: true,
    flagImageCode: 'CO',
    currency: {
      symbol: '$',
      code: 'COP',
      name: 'Colombian Peso',
    },
    countryCode: 'CO',
    otherCountryCodes: ['COL'],
    isForRestOfCountries: false,
  };

  const mockPointOfSale2: PointOfSale = {
    name: 'United States',
    stationCode: 'MIA',
    code: 'US',
    default: false,
    flagImageCode: 'US',  
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'US Dollar',
    },
    countryCode: 'US',
    otherCountryCodes: ['USA'],
    isForRestOfCountries: false,
  };

  const mockPointOfSaleList: PointOfSale[] = [mockPointOfSale1, mockPointOfSale2];

  const mockPointOfSaleStored: PointOfSaleStored = {
    posCode: 'CO',
    stationCode: 'BOG',
    userInteractWithPOSSelectorFlag: false,
  };

  const mockSessionSettingsResponse: SessionSettingsResponse = {
    success: true,
    response: {
      countryCode: 'US',
    },
  } as SessionSettingsResponse;

  let sessionSettingsSubject: BehaviorSubject<SessionSettingsResponse | null>;

  beforeEach(() => {
    sessionSettingsSubject = new BehaviorSubject<SessionSettingsResponse | null>(null);
    
    mockStorageService = jasmine.createSpyObj('StorageService', [
      'setLocalStorage',
      'getLocalStorage',
      'setSessionStorage',
      'getSessionStorage',
    ]);
    
    mockCurrencyService = jasmine.createSpyObj('CurrencyService', [
      'setCurrency',
    ]);
    
    mockEventBusService = jasmine.createSpyObj('EventBusService', [
      'notifyEvent',
    ]);
    
    mockSessionSettingsService = jasmine.createSpyObj('SessionSettingsService', [], {
      sessionSettingsData$: sessionSettingsSubject.asObservable(),
    });
    
    mockLocation = jasmine.createSpyObj('Location', ['path']);

    TestBed.configureTestingModule({
      providers: [
        PointOfSaleService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: EventBusService, useValue: mockEventBusService },
        { provide: SessionSettingsService, useValue: mockSessionSettingsService },
        { provide: Location, useValue: mockLocation },
      ],
    });

    service = TestBed.inject(PointOfSaleService);
  });

  describe('constructor', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('initializePointsOfSale', () => {
    it('should initialize points of sale list and set initial point of sale', () => {
      spyOn(service as any, 'loadPointOfSale');
      spyOn(service as any, 'subscribeToSessionSettings');

      service.initializePointsOfSale(mockPointOfSaleList);

      expect((service as any).pointsOfSaleList).toEqual(mockPointOfSaleList);
      expect((service as any).loadPointOfSale).toHaveBeenCalled();
      expect((service as any).subscribeToSessionSettings).toHaveBeenCalled();
    });
  });

  describe('getCurrentPointOfSale', () => {
    it('should return current point of sale from subject', () => {
      (service as any).pointOfSaleSubject.next(mockPointOfSale1);

      const result = service.getCurrentPointOfSale();

      expect(result).toEqual(mockPointOfSale1);
    });

    it('should return null when no point of sale is set', () => {
      const result = service.getCurrentPointOfSale();

      expect(result).toBeNull();
    });
  });

  describe('changePointOfSale', () => {
    it('should change point of sale on storage and update currency', () => {
      spyOn(service as any, 'setPointOfSaleToStorage').and.callThrough();

      service.changePointOfSale(mockPointOfSale2, true);

      expect((service as any).setPointOfSaleToStorage).toHaveBeenCalledWith(mockPointOfSale2, true);
      expect(mockCurrencyService.setCurrency).toHaveBeenCalledWith(mockPointOfSale2.currency.code, true);
      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale2);
    });

    it('should use default userInteractWithPOSSelectorFlag when not provided', () => {
      spyOn(service as any, 'setPointOfSaleToStorage').and.callThrough();

      service.changePointOfSale(mockPointOfSale2);

      expect((service as any).setPointOfSaleToStorage).toHaveBeenCalledWith(mockPointOfSale2, true);
      expect(mockCurrencyService.setCurrency).toHaveBeenCalledWith(mockPointOfSale2.currency.code, true);
    });
  });

  describe('updatePosCodeInUrl (private)', () => {
    it('should update both normal and lowercase URL parameters', () => {
      spyOn(urlHelpers, 'updateUrlParameter');

      service.updatePosCodeInUrl('US');

      expect(urlHelpers.updateUrlParameter).toHaveBeenCalledWith('posCode', 'US');
      expect(urlHelpers.updateUrlParameter).toHaveBeenCalledWith('poscode', 'US');
      expect(urlHelpers.updateUrlParameter).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadPointOfSale (private)', () => {
    beforeEach(() => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
    });

    it('should return early if points of sale list is empty', () => {
      (service as any).pointsOfSaleList = [];
      (service as any).pointOfSaleSubject.next(null);

      spyOn(service as any, 'getCodeFromUrl');

      (service as any).loadPointOfSale();

      expect(service.getCurrentPointOfSale()).toBeNull();
    });

    it('should set point of sale from URL when code exists in URL', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('US');
      spyOn(service as any, 'setPointOfSaleToStorage');

      (service as any).loadPointOfSale();

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale2);
      expect((service as any).setPointOfSaleToStorage).toHaveBeenCalledWith(mockPointOfSale2, false);
    });

    it('should set point of sale from storage when found in list', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('');
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue(mockPointOfSaleStored);

      (service as any).loadPointOfSale();

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale1);
    });

    it('should set default point of sale when no URL code and no storage', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('');
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue(null);
      spyOn(service as any, 'setPointOfSaleToStorage');

      (service as any).loadPointOfSale();

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale1);
      expect((service as any).setPointOfSaleToStorage).toHaveBeenCalledWith(mockPointOfSale1, false);
    });

    it('should prioritize URL over session storage', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('US');
      spyOn(service as any, 'getStoredUserInteractionFlagForCode').and.returnValue(false);
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue(mockPointOfSaleStored);
      spyOn(service as any, 'setPointOfSale');

      (service as any).loadPointOfSale();

      expect((service as any).setPointOfSale).toHaveBeenCalledWith(mockPointOfSale2, false);
      expect((service as any).getPointOfSaleFromSessionStorage).not.toHaveBeenCalled();
    });

    it('should get point of sale from session storage', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('');
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue({
        posCode: 'US',
        name: 'United States', 
        default: true,
        stationCode: 'MIA',
        userInteractWithPOSSelectorFlag: true,
        imgSrc: 'http://localhost/assets/imgs/countries-flags/us.svg',
        otherCountryCodes: [ 'COL' ],
        currency: { symbol: '$', code: 'USD', name: 'US Dollar' } 
      });
      spyOn(service as any, 'setPointOfSale');

      (service as any).loadPointOfSale();

      expect((service as any).setPointOfSale).toHaveBeenCalledWith(mockPointOfSale2, true);
    });

    it('should fall back to default when session storage is empty', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('');
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue(null);
      spyOn(service as any, 'setPointOfSale');

      (service as any).loadPointOfSale();

      expect((service as any).setPointOfSale).toHaveBeenCalledWith(mockPointOfSale1, false);
    });
  });

  describe('setPointOfSaleToStorage (private)', () => {
    it('should set point of sale to session storage', () => {
      spyOn(service as any, 'setPointOfSaleToSessionStorage');

      (service as any).setPointOfSaleToStorage(mockPointOfSale1, true);

      expect((service as any).setPointOfSaleToSessionStorage).toHaveBeenCalledWith(mockPointOfSale1, true);
    });
  });

  describe('getPointOfSaleFromSessionStorage (private)', () => {
    it('should get point of sale from session storage', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockPointOfSaleStored);

      const result = (service as any).getPointOfSaleFromSessionStorage();

      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PointOfSale);
      expect(result).toEqual(mockPointOfSaleStored);
    });

    it('should return null when no data in session storage', () => {
      mockStorageService.getSessionStorage.and.returnValue(null);

      const result = (service as any).getPointOfSaleFromSessionStorage();

      expect(result).toBeNull();
    });
  });

  describe('setPointOfSaleToSessionStorage (private)', () => {
    it('should set point of sale to session storage', () => {
      (service as any).setPointOfSaleToSessionStorage(mockPointOfSale1, true);
      expect(mockStorageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PointOfSale, {
        name: 'Colombia',
        stationCode: 'BOG',
        posCode: 'CO',
        default: true,
        otherCountryCodes: ['COL'],
        currency: jasmine.objectContaining({
          symbol: '$',
          code: 'COP',
          name: 'Colombian Peso'
        }),
        imgSrc: jasmine.any(String),
        userInteractWithPOSSelectorFlag: jasmine.any(Boolean)
      });
    });

    it('should not set anything when point of sale is null', () => {
      (service as any).setPointOfSaleToSessionStorage(null, true);

      expect(mockStorageService.setSessionStorage).not.toHaveBeenCalled();
    });
  });

  describe('findByCodeOrCountryCode (private)', () => {
    beforeEach(() => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
    });

    it('should find point of sale by country code', () => {
      const result = (service as any).findByCodeOrCountryCode('US');

      expect(result).toEqual(mockPointOfSale2);
    });

    it('should find point of sale by code', () => {
      const result = (service as any).findByCodeOrCountryCode('CO');

      expect(result).toEqual(mockPointOfSale1);
    });

    it('should find point of sale by other country codes', () => {
      const result = (service as any).findByCodeOrCountryCode('USA');

      expect(result).toEqual(mockPointOfSale2);
    });

    it('should return undefined when code not found', () => {
      const result = (service as any).findByCodeOrCountryCode('XX');

      expect(result).toBeUndefined();
    });

    it('should handle case insensitive search', () => {
      const result = (service as any).findByCodeOrCountryCode('us');

      expect(result).toEqual(mockPointOfSale2);
    });
  });

  describe('getDefault (private)', () => {
    it('should return default point of sale when available', () => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;

      const result = (service as any).getDefault();

      expect(result).toEqual(mockPointOfSale1);
    });

    it('should return first point of sale when no default is set', () => {
      const pointsWithoutDefault = [
        { ...mockPointOfSale1, default: false },
        { ...mockPointOfSale2, default: false },
      ];
      (service as any).pointsOfSaleList = pointsWithoutDefault;

      const result = (service as any).getDefault();

      expect(result).toEqual(pointsWithoutDefault[0]);
    });

    it('should return null when points list is empty', () => {
      (service as any).pointsOfSaleList = [];

      const result = (service as any).getDefault();

      expect(result).toBeNull();
    });
  });

  describe('getCodeFromUrl (private)', () => {
    it('should get posCode parameter from URL', () => {
      mockLocation.path.and.returnValue('/search?posCode=US');
      spyOn(urlHelpers, 'getParameterByName').and.returnValue('US');

      const result = (service as any).getCodeFromUrl();

      expect(result).toBe('US');
      expect(urlHelpers.getParameterByName).toHaveBeenCalledWith('posCode', '/search?posCode=US');
    });

    it('should get poscode parameter from URL when posCode is not found', () => {
      mockLocation.path.and.returnValue('/search?poscode=US');
      spyOn(urlHelpers, 'getParameterByName').and.returnValues('', 'US');

      const result = (service as any).getCodeFromUrl();

      expect(result).toBe('US');
    });

    it('should return empty string when no parameters found', () => {
      mockLocation.path.and.returnValue('/search');
      spyOn(urlHelpers, 'getParameterByName').and.returnValues('', '');

      const result = (service as any).getCodeFromUrl();

      expect(result).toBe('');
    });
  });

  describe('hasCodeInUrl (private)', () => {
    it('should return true when code exists in URL', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('US');

      const result = (service as any).hasCodeInUrl();

      expect(result).toBe(true);
    });

    it('should return false when no code in URL', () => {
      spyOn(service as any, 'getCodeFromUrl').and.returnValue('');

      const result = (service as any).hasCodeInUrl();

      expect(result).toBe(false);
    });
  });

  describe('shouldProcessSession (private)', () => {
    it('should return false when response is null', () => {
      const result = (service as any).shouldProcessSession(null);

      expect(result).toBe(false);
    });

    it('should return false when code exists in URL', () => {
      spyOn(service as any, 'hasCodeInUrl').and.returnValue(true);

      const result = (service as any).shouldProcessSession(mockSessionSettingsResponse);

      expect(result).toBe(false);
    });

    it('should return false when user has interacted with POS selector', () => {
      spyOn(service as any, 'hasCodeInUrl').and.returnValue(false);
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue({
        ...mockPointOfSaleStored,
        userInteractWithPOSSelectorFlag: true,
      });

      const result = (service as any).shouldProcessSession(mockSessionSettingsResponse);

      expect(result).toBe(false);
    });

    it('should return true when conditions are met for processing', () => {
      spyOn(service as any, 'hasCodeInUrl').and.returnValue(false);
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue({
        ...mockPointOfSaleStored,
        userInteractWithPOSSelectorFlag: false,
      });

      const result = (service as any).shouldProcessSession(mockSessionSettingsResponse);

      expect(result).toBe(true);
    });
  });

  describe('isSameSelection (private)', () => {
    it('should return true when both point of sales have same code', () => {
      const result = (service as any).isSameSelection(mockPointOfSale1, mockPointOfSale1);

      expect(result).toBe(true);
    });

    it('should return false when point of sales have different codes', () => {
      const result = (service as any).isSameSelection(mockPointOfSale1, mockPointOfSale2);

      expect(result).toBe(false);
    });

    it('should return false when current point of sale is null', () => {
      const result = (service as any).isSameSelection(null, mockPointOfSale1);

      expect(result).toBe(false);
    });
  });

  describe('subscribeToSessionSettings (private)', () => {
    it('should update point of sale when session settings change and conditions are met', () => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
      spyOn(service as any, 'shouldProcessSession').and.returnValue(true);
      
      (service as any).subscribeToSessionSettings();

      sessionSettingsSubject.next(mockSessionSettingsResponse);

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale2);
    });

    it('should not update point of sale when shouldProcessSession returns false', () => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
      (service as any).pointOfSaleSubject.next(mockPointOfSale1);
      spyOn(service as any, 'shouldProcessSession').and.returnValue(false);
      
      (service as any).subscribeToSessionSettings();
      
      // Emit session settings data
      sessionSettingsSubject.next(mockSessionSettingsResponse);

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale1);
    });

    it('should not update point of sale when same selection', () => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
      (service as any).pointOfSaleSubject.next(mockPointOfSale2);
      spyOn(service as any, 'shouldProcessSession').and.returnValue(true);
      
      (service as any).subscribeToSessionSettings();
      
      // Emit session settings data
      sessionSettingsSubject.next(mockSessionSettingsResponse);

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale2);
    });

    it('should use default when country code not found in list', () => {
      (service as any).pointsOfSaleList = mockPointOfSaleList;
      spyOn(service as any, 'shouldProcessSession').and.returnValue(true);
      
      const sessionResponseWithUnknownCountry: SessionSettingsResponse = {
        success: true,
        response: { countryCode: 'XX' },
      } as SessionSettingsResponse;
      
      (service as any).subscribeToSessionSettings();

      sessionSettingsSubject.next(sessionResponseWithUnknownCountry);

      expect(service.getCurrentPointOfSale()).toEqual(mockPointOfSale1);
    });
  });

  describe('hasUserInteractedWithPOSSelector (private)', () => {
    it('should return true when session storage has interaction flag', () => {
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue({
        ...mockPointOfSaleStored,
        userInteractWithPOSSelectorFlag: true,
      });

      const result = (service as any).hasUserInteractedWithPOSSelector();

      expect(result).toBe(true);
    });

    it('should return false when no interaction flag is set', () => {
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue(null);

      const result = (service as any).hasUserInteractedWithPOSSelector();

      expect(result).toBe(false);
    });
  });

  describe('getStoredUserInteractionFlagForCode (private)', () => {
    it('should return session storage flag when code matches', () => {
      spyOn(service as any, 'getPointOfSaleFromSessionStorage').and.returnValue({
        posCode: 'US',
        stationCode: 'MIA',
        userInteractWithPOSSelectorFlag: true,
      });

      const result = (service as any).getStoredUserInteractionFlagForCode('US');

      expect(result).toBe(true);
    });
  });

  describe('pointOfSale$ (observable)', () => {
    it('should emit point of sale changes', (done) => {
      service.pointOfSale$.subscribe((pos) => {
        if (pos) {
          expect(pos).toEqual(mockPointOfSale1);
          done();
        }
      });

      (service as any).pointOfSaleSubject.next(mockPointOfSale1);
    });

    it('should emit null initially', (done) => {
      service.pointOfSale$.subscribe((pos) => {
        expect(pos).toBeNull();
        done();
      });
    });
  });
});
