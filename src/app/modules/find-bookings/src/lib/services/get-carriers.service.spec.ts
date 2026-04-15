import { TestBed } from '@angular/core/testing';

import { GetCarrierService } from './get-carriers.service';
import { FindBookingsConfig } from '../models/find-bookings.config';

describe('GetCarrierService', () => {
  let service: GetCarrierService;

  const mockConfig: FindBookingsConfig = {
    carriersList: [
      { code: 'AV', name: 'Avianca' },
      { code: 'AA', name: 'American Airlines' },
      { code: 'DL', name: 'Delta Air Lines' },
    ],
    airCraftList: [],
    dialogModalsRepository: {
      modalDialogExceptions: [],
    },
    checkinUrl: '',
    mmbUrl: '',
    earlyCheckinEligibleStationCodes: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetCarrierService],
    });
    service = TestBed.inject(GetCarrierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCarrierName', () => {
    it('should return carrier name when code matches', () => {
      const result = service.getCarrierName(mockConfig, 'AV');
      expect(result).toBe('Avianca');
    });

    it('should return carrier name when code matches (case insensitive)', () => {
      const result = service.getCarrierName(mockConfig, 'av');
      expect(result).toBe('Avianca');
    });

    it('should return carrier code when not found in list', () => {
      const result = service.getCarrierName(mockConfig, 'ZZ');
      expect(result).toBe('ZZ');
    });

    it('should return carrier code when config is null', () => {
      const result = service.getCarrierName(null, 'AV');
      expect(result).toBe('AV');
    });

    it('should match carrier by name (case insensitive)', () => {
      const result = service.getCarrierName(mockConfig, 'AVIANCA');
      expect(result).toBe('Avianca');
    });
  });
});
