import { TestBed } from '@angular/core/testing';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';
import { Service } from '@dcx/ui/api-layer';
import { PendingSeatServicesService } from './pending-seat-services.service';

describe('PendingSeatServicesService', () => {
  let service: PendingSeatServicesService;
  let storageService: jasmine.SpyObj<StorageService>;

  const mockService: Service = {
    id: 'service-1',
    paxId: 'pax-1',
    sellKey: 'segment-1',
    code: '12A',
    type: 'Seat',
  } as Service;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
      'removeSessionStorage',
    ]);

    TestBed.configureTestingModule({
      providers: [PendingSeatServicesService, { provide: StorageService, useValue: storageServiceSpy }],
    });

    service = TestBed.inject(PendingSeatServicesService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPendingSeatServices', () => {
    it('should return services from storage', () => {
      storageService.getSessionStorage.and.returnValue([mockService]);

      const result = service.getPendingSeatServices();

      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices);
      expect(result).toEqual([mockService]);
    });

    it('should return empty array when no services in storage', () => {
      storageService.getSessionStorage.and.returnValue(null);

      const result = service.getPendingSeatServices();

      expect(result).toEqual([]);
    });
  });

  describe('setPendingSeatServices', () => {
    it('should store services in session storage', () => {
      service.setPendingSeatServices([mockService]);

      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices, [mockService]);
    });
  });

  describe('getPendingSeatForPassengerAndSegment', () => {
    it('should return matching service', () => {
      storageService.getSessionStorage.and.returnValue([mockService]);

      const result = service.getPendingSeatForPassengerAndSegment('pax-1', 'segment-1');

      expect(result).toEqual(mockService);
    });

    it('should return undefined when no match found', () => {
      storageService.getSessionStorage.and.returnValue([mockService]);

      const result = service.getPendingSeatForPassengerAndSegment('pax-2', 'segment-2');

      expect(result).toBeUndefined();
    });
  });

  describe('addPendingSeatService', () => {
    it('should add new service', () => {
      storageService.getSessionStorage.and.returnValue([]);

      service.addPendingSeatService(mockService);

      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices, [mockService]);
    });

    it('should replace existing service for same pax/segment', () => {
      const updatedService = { ...mockService, code: '12B' };
      storageService.getSessionStorage.and.returnValue([mockService]);

      service.addPendingSeatService(updatedService);

      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices, [
        updatedService,
      ]);
    });
  });

  describe('removePendingSeatService', () => {
    it('should remove service for specific pax and segment', () => {
      const service2 = { ...mockService, paxId: 'pax-2' } as Service;
      storageService.getSessionStorage.and.returnValue([mockService, service2]);

      service.removePendingSeatService('pax-1', 'segment-1');

      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices, [service2]);
    });
  });

  describe('clearPendingSeatServices', () => {
    it('should remove all pending services from storage', () => {
      service.clearPendingSeatServices();

      expect(storageService.removeSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PendingSeatServices);
    });
  });

  describe('hasPendingSeatServices', () => {
    it('should return true when services exist', () => {
      storageService.getSessionStorage.and.returnValue([mockService]);

      expect(service.hasPendingSeatServices()).toBe(true);
    });

    it('should return false when no services exist', () => {
      storageService.getSessionStorage.and.returnValue([]);

      expect(service.hasPendingSeatServices()).toBe(false);
    });
  });
});
