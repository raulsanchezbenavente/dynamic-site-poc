import { TestBed } from '@angular/core/testing';
import {
  CultureServiceEx,
  EnumStorageKey,
  LoggerService,
  PointOfSale,
  PointOfSaleService,
  PointOfSaleStored,
  StorageService,
} from '@dcx/ui/libs';

import { StorageSyncService } from './storage-sync.service';

class MockStorageService {
  getSessionStorage = jasmine.createSpy('getSessionStorage');
  setSessionStorage = jasmine.createSpy('setSessionStorage');
}

class MockCultureService {
  getCulture = jasmine.createSpy('getCulture').and.returnValue('en');
  setCulture = jasmine.createSpy('setCulture');
  getSupportedCultures = jasmine.createSpy('getSupportedCultures').and.returnValue(['en', 'es', 'fr']);
}

class MockPointOfSaleService {
  findPointOfSaleByCode = jasmine.createSpy('findPointOfSaleByCode');
  changePointOfSale = jasmine.createSpy('changePointOfSale');
}

class MockLoggerService {
  info = jasmine.createSpy('info');
  warn = jasmine.createSpy('warn');
  error = jasmine.createSpy('error');
}

describe('StorageSyncService', () => {
  let service: StorageSyncService;
  let storageService: MockStorageService;
  let cultureServiceEx: MockCultureService;
  let pointOfSaleService: MockPointOfSaleService;
  let logger: MockLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageSyncService,
        { provide: StorageService, useClass: MockStorageService },
        { provide: CultureServiceEx, useClass: MockCultureService },
        { provide: PointOfSaleService, useClass: MockPointOfSaleService },
        { provide: LoggerService, useClass: MockLoggerService },
      ],
    });

    service = TestBed.inject(StorageSyncService);
    storageService = TestBed.inject(StorageService) as unknown as MockStorageService;
    cultureServiceEx = TestBed.inject(CultureServiceEx) as unknown as MockCultureService;
    pointOfSaleService = TestBed.inject(PointOfSaleService) as unknown as MockPointOfSaleService;
    logger = TestBed.inject(LoggerService) as unknown as MockLoggerService;
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('syncFromLStorage', () => {
    it('should log start and completion messages', () => {
      storageService.getSessionStorage.and.returnValue(null);

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith('StorageSyncService', 'Starting storage sync');
      expect(logger.info).toHaveBeenCalledWith('StorageSyncService', 'Storage sync completed');
    });

    it('should handle errors during synchronization', () => {
      const error = new Error('Sync error');
      storageService.getSessionStorage.and.throwError(error);

      service.syncFromStorage();

      // Errors are caught in the individual sync methods
      expect(logger.error).toHaveBeenCalledWith(
        'StorageSyncService',
        'Error during culture and language synchronization',
        jasmine.any(Error)
      );
      expect(logger.error).toHaveBeenCalledWith(
        'PointOfSaleSyncService',
        'Error syncing point of sale from storage',
        jasmine.any(Error)
      );
    });
  });

  describe('syncCultureAndLanguage', () => {
    const posStored: PointOfSaleStored = {
      posCode: 'US',
      stationCode: 'NYC',
      userInteractWithPOSSelectorFlag: true,
    };
    const mockPos: PointOfSale = {
      code: 'US',
      name: 'United States',
    } as PointOfSale;

    beforeEach(() => {
      pointOfSaleService.findPointOfSaleByCode.and.returnValue(mockPos);
    });

    it('should not sync when no language is stored and URL culture is not set', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('');

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith('StorageSyncService', 'No lang found to sync');
      expect(cultureServiceEx.setCulture).not.toHaveBeenCalled();
      expect(storageService.setSessionStorage).not.toHaveBeenCalled();
    });

    it('should warn when culture is not supported', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Language) return 'de';
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('');

      service.syncFromStorage();

      expect(logger.warn).toHaveBeenCalledWith('StorageSyncService', 'Culture not supported: de');
      expect(cultureServiceEx.setCulture).not.toHaveBeenCalled();
      expect(storageService.setSessionStorage).not.toHaveBeenCalled();
    });

    it('should not sync when culture is already set', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Language) return 'en';
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('en');

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith('StorageSyncService', 'Culture already set to: en');
      expect(cultureServiceEx.setCulture).not.toHaveBeenCalled();
    });

    it('should update storage when URL culture differs from storage', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Language) return 'en-US';
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('es');

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith(
        'StorageSyncService',
        'URL culture differs from storage. Updating storage: en -> es'
      );
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.Language, 'es');
      expect(cultureServiceEx.setCulture).toHaveBeenCalledWith('es');
    });

    it('should not update storage when URL culture matches storage', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Language) return 'es-ES';
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('es');

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith('StorageSyncService', 'Culture already set to: es-ES');
      expect(storageService.setSessionStorage).not.toHaveBeenCalled();
      expect(cultureServiceEx.setCulture).not.toHaveBeenCalled();
    });

    it('should update storage when URL culture is supported and differs from storage', () => {
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.Language) return 'fr';
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      cultureServiceEx.getCulture.and.returnValue('en');

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith(
        'StorageSyncService',
        'URL culture differs from storage. Updating storage: fr -> en'
      );
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.Language, 'en');
      expect(cultureServiceEx.setCulture).toHaveBeenCalledWith('en');
    });
  });

  describe('syncPointOfSale', () => {
    it('should warn when no point of sale is stored', () => {
      storageService.getSessionStorage.and.returnValue(null);

      service.syncFromStorage();

      expect(logger.warn).toHaveBeenCalledWith('PointOfSaleSyncService', 'Point of sale not found in session storage');
      expect(pointOfSaleService.changePointOfSale).not.toHaveBeenCalled();
    });

    it('should warn when point of sale code is not found', () => {
      const posStored: PointOfSaleStored = {
        posCode: 'INVALID',
        stationCode: 'STA',
        userInteractWithPOSSelectorFlag: false,
      };
      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      pointOfSaleService.findPointOfSaleByCode.and.returnValue(null);

      service.syncFromStorage();

      expect(logger.warn).toHaveBeenCalledWith(
        'PointOfSaleSyncService',
        'Point of sale not found for code: INVALID'
      );
      expect(pointOfSaleService.changePointOfSale).not.toHaveBeenCalled();
    });

    it('should sync point of sale successfully', () => {
      const mockPos: PointOfSale = {
        code: 'US',
        name: 'United States',
      } as PointOfSale;
      const posStored: PointOfSaleStored = {
        posCode: 'US',
        stationCode: 'NYC',
        userInteractWithPOSSelectorFlag: true,
      };

      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      pointOfSaleService.findPointOfSaleByCode.and.returnValue(mockPos);

      service.syncFromStorage();

      expect(logger.info).toHaveBeenCalledWith('PointOfSaleSyncService', 'Syncing point of sale from storage: US');
      expect(pointOfSaleService.changePointOfSale).toHaveBeenCalledWith(mockPos, true);
    });

    it('should handle errors during point of sale sync', () => {
      const error = new Error('POS sync error');
      const posStored: PointOfSaleStored = {
        posCode: 'US',
        stationCode: 'LAX',
        userInteractWithPOSSelectorFlag: false,
      };

      storageService.getSessionStorage.and.callFake((key: string) => {
        if (key === EnumStorageKey.PointOfSale) return posStored;
        return null;
      });
      pointOfSaleService.findPointOfSaleByCode.and.throwError(error);

      service.syncFromStorage();

      expect(logger.error).toHaveBeenCalledWith(
        'PointOfSaleSyncService',
        'Error syncing point of sale from storage',
        error
      );
    });
  });
});
