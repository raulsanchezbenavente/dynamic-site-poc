import { TestBed } from '@angular/core/testing';
import { AccountStateService } from './account-state.service';
import { StorageService } from '../storage.service';
import { EnumStorageKey } from '../../enums/enum-storage-keys';
import { CustomerAccount } from '@dcx/ui/business-common';

describe('AccountStateService', () => {
  let service: AccountStateService;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  const mockAccountData: CustomerAccount = {
    customerNumber: '12345',
    firstName: 'Juan',
    lastName: 'Pérez',
    balance: { lifemiles: { amount: 0 } },
    customerPrograms: {},
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
      'removeSessionStorage',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AccountStateService,
        { provide: StorageService, useValue: spy },
      ],
    });

    storageServiceMock = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    service = TestBed.inject(AccountStateService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null account data if storage is empty', () => {
      storageServiceMock.getSessionStorage.and.returnValue(null);

      expect(service.getAccountData()).toBeNull();
    });
  });

  describe('setAccountData', () => {
    it('should set account data and save to storage', () => {
      service.setAccountData(mockAccountData);

      expect(service.getAccountData()).toEqual(mockAccountData);
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.AccountStateData,
        mockAccountData
      );
    });

    it('should update existing account data', () => {
      service.setAccountData(mockAccountData);

      const updatedData: CustomerAccount = {
        ...mockAccountData,
        firstName: 'Pedro',
      };

      service.setAccountData(updatedData);

      expect(service.getAccountData()).toEqual(updatedData);
      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.AccountStateData,
        updatedData
      );
    });

    it('should clear account data when null is passed', () => {
      service.setAccountData(mockAccountData);
      service.setAccountData(null);

      expect(service.getAccountData()).toBeNull();
      // Storage is not updated when null is passed
      expect(storageServiceMock.setSessionStorage).not.toHaveBeenCalledWith(
        EnumStorageKey.AccountStateData,
        null
      );
    });
  });

  describe('getAccountData', () => {
    it('should return current account data synchronously', () => {
      service.setAccountData(mockAccountData);

      const result = service.getAccountData();

      expect(result).toEqual(mockAccountData);
    });

    it('should return null when no account data is set', () => {
      const result = service.getAccountData();

      expect(result).toBeNull();
    });
  });

  describe('onAccountChange', () => {
    it('should invoke callback when account data changes', (done) => {
      const callback = jasmine.createSpy('callback');
      service.onAccountChange(callback);

      service.setAccountData(mockAccountData);

      // Use setTimeout to allow effect to run
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(mockAccountData);
        done();
      }, 0);
    });

    it('should not invoke callback when account data is set to null', (done) => {
      const callback = jasmine.createSpy('callback');
      service.onAccountChange(callback);

      service.setAccountData(null);

      // Use setTimeout to allow effect to run
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should invoke callback with updated data on subsequent changes', (done) => {
      const callback = jasmine.createSpy('callback');
      service.onAccountChange(callback);

      service.setAccountData(mockAccountData);

      setTimeout(() => {
        const updatedData: CustomerAccount = {
          ...mockAccountData,
          firstName: 'Carlos',
        };

        service.setAccountData(updatedData);

        setTimeout(() => {
          expect(callback).toHaveBeenCalledWith(updatedData);
          expect(callback).toHaveBeenCalledTimes(2);
          done();
        }, 0);
      }, 0);
    });

    it('should replace previous callback with new one', (done) => {
      const callback1 = jasmine.createSpy('callback1');
      const callback2 = jasmine.createSpy('callback2');

      service.onAccountChange(callback1);
      service.onAccountChange(callback2);

      service.setAccountData(mockAccountData);

      setTimeout(() => {
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledWith(mockAccountData);
        done();
      }, 0);
    });
  });

  describe('loadFromStorage', () => {
    it('should call getSessionStorage during service initialization', () => {
      // This is tested implicitly through the beforeEach setup
      // The service is created in beforeEach which calls loadFromStorage
      expect(storageServiceMock.getSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.AccountStateData
      );
    });
  });

  describe('saveAccountDataToStorage', () => {
    it('should save account data to storage', () => {
      service.setAccountData(mockAccountData);

      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.AccountStateData,
        mockAccountData
      );
    });

    it('should not save to storage when null is passed', () => {
      service.setAccountData(mockAccountData);
      const initialCallCount = storageServiceMock.setSessionStorage.calls.count();

      service.setAccountData(null);

      // Should not make additional setSessionStorage calls
      expect(storageServiceMock.setSessionStorage.calls.count()).toBe(initialCallCount);
    });
  });

  describe('signal reactivity', () => {
    it('should expose account data as readonly signal', () => {
      service.setAccountData(mockAccountData);

      const accountSignal = service.accountDto();
      expect(accountSignal).toEqual(mockAccountData);
    });

    it('should update readonly signal when account data changes', () => {
      service.setAccountData(mockAccountData);
      let firstValue = service.accountDto();
      expect(firstValue).toEqual(mockAccountData);

      const updatedData: CustomerAccount = {
        ...mockAccountData,
        firstName: 'Miguel',
      };

      service.setAccountData(updatedData);
      let secondValue = service.accountDto();
      expect(secondValue).toEqual(updatedData);
    });
  });
});
