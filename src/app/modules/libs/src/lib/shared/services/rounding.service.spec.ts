import { TestBed } from '@angular/core/testing';
 import { RoundingService } from './rounding.service';
 import { BUSINESS_CONFIG } from '../injection-tokens';
 import { BusinessConfig } from '../model';

 describe('RoundingService', () => {
  let service: RoundingService;

  describe('with BUSINESS_CONFIG provided', () => {
    const mockBusinessConfig: BusinessConfig = {
      roundingCurrencyFactors: [
        { code: 'USD', factor: '0.01' },
        { code: 'EUR', factor: '1' },
        { code: 'JPY', factor: '10' },
        { code: 'KRW', factor: '100' },
      ],
      imagePopUpFrecuencyTime: 0,
      manageCountries: {},
      passengers: {},
      phoneValidationMessage: {},
      prefixValidationMessage: {}
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          RoundingService,
          { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        ],
      });
      service = TestBed.inject(RoundingService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return the original value if it is an integer', () => {
      expect(service.roundAmount('USD', 10)).toBe(10);
      expect(service.roundAmount('EUR', 0)).toBe(0);
      expect(service.roundAmount('JPY', -5)).toBe(-5);
    });

    it('should round to 2 decimal places for USD', () => {
      expect(service.roundAmount('USD', 10.123)).toBe(10.12);
      expect(service.roundAmount('USD', 10.125)).toBe(10.13);
      expect(service.roundAmount('USD', 10.129)).toBe(10.13);
    });

    it('should round to the nearest whole number for EUR', () => {
      expect(service.roundAmount('EUR', 10.123)).toBe(10);
      expect(service.roundAmount('EUR', 10.5)).toBe(11);
      expect(service.roundAmount('EUR', 10.99)).toBe(11);
    });

    it('should round to the nearest 10 for JPY', () => {
      expect(service.roundAmount('JPY', 10.123)).toBe(10);
      expect(service.roundAmount('JPY', 15.5)).toBe(20);
      expect(service.roundAmount('JPY', 10.99)).toBe(10);
    });

    it('should round to the nearest 100 for KRW', () => {
      expect(service.roundAmount('KRW', 101.123)).toBe(100);
      expect(service.roundAmount('KRW', 150)).toBe(150);
      expect(service.roundAmount('KRW', 199.99)).toBe(200);
    });

    it('should round to 2 decimal places for unknown currencies', () => {
      expect(service.roundAmount('GBP', 10.123)).toBe(10.12);
      expect(service.roundAmount('GBP', 10.125)).toBe(10.13);
    });
  });

  describe('without BUSINESS_CONFIG provided', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          RoundingService,
        ],
      });
      service = TestBed.inject(RoundingService);
    });

    it('should round to 2 decimal places if BUSINESS_CONFIG is not provided', () => {
      expect(service.roundAmount('USD', 10.123)).toBe(10.12);
      expect(service.roundAmount('USD', 10.125)).toBe(10.13);
    });

    it('should return the original value if it is an integer (even without BUSINESS_CONFIG)', () => {
      expect(service.roundAmount('USD', 10)).toBe(10);
    });
  });
 });