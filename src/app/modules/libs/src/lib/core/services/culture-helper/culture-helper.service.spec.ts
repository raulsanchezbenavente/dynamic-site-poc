import { TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';

import { NameOrder, TextDirection } from '../../enums';
import { UserCulture } from '../../models';

import { CultureHelperService } from './culture-helper.service';

describe('CultureHelperService', () => {
  let service: CultureHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CultureHelperService],
    });

    service = TestBed.inject(CultureHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getShortDateFormat', () => {
    it('should map en-US short date format to dayjs tokens', () => {
      expect(service.getShortDateFormat('en-US')).toBe('MM/DD/YYYY');
    });
  });

  describe('getLongDateFormat', () => {
    it('should map en-US long date format to dayjs tokens', () => {
      expect(service.getLongDateFormat('en-US')).toBe('dddd, MMMM D, YYYY');
    });
  });

  describe('getTimeFormat', () => {
    it('should include hour, minute, and period tokens for en-US', () => {
      const format = service.getTimeFormat('en-US');
      expect(format).toContain('hh');
      expect(format).toContain('mm');
      expect(format).toContain('A');
    });
  });

  describe('is24HourFormat', () => {
    it('should return false for en-US', () => {
      expect(service.is24HourFormat('en-US')).toBeFalse();
    });

    it('should return true for fr-FR', () => {
      expect(service.is24HourFormat('fr-FR')).toBeTrue();
    });
  });

  describe('getDecimalSeparator', () => {
    it('should use comma for de-DE', () => {
      expect(service.getDecimalSeparator('de-DE')).toBe(',');
    });
  });

  describe('getThousandsSeparator', () => {
    it('should use dot for de-DE', () => {
      expect(service.getThousandsSeparator('de-DE')).toBe('.');
    });
  });

  describe('getNameOrder', () => {
    it('should return last-first for Japanese locale', () => {
      expect(service.getNameOrder('ja-JP')).toBe(NameOrder.LAST_FIRST);
    });

    it('should return first-last for English locale', () => {
      expect(service.getNameOrder('en-US')).toBe(NameOrder.FIRST_LAST);
    });
  });

  describe('getDirection', () => {
    it('should return rtl for Arabic locale', () => {
      expect(service.getDirection('ar-SA')).toBe(TextDirection.RIGHT_TO_LEFT);
    });

    it('should return ltr for English locale', () => {
      expect(service.getDirection('en-US')).toBe(TextDirection.LEFT_TO_RIGHT);
    });
  });

  describe('getCurrencyFromLocale', () => {
    it('should return currency for exact locale', () => {
      expect(service.getCurrencyFromLocale('es-ES')).toBe('EUR');
    });

    it('should fall back to USD when locale is unknown', () => {
      expect(service.getCurrencyFromLocale('es-XX')).toBe('USD');
    });
  });

  describe('formatNumber', () => {
    it('should format using culture locale', () => {
      const culture: UserCulture = { locale: 'de-DE' };
      expect(service.formatNumber(1234.56, culture)).toBe('1.234,56');
    });
  });

  describe('formatShortDate', () => {
    it('should format using culture short date format', () => {
      const culture: UserCulture = { shortDateFormat: 'DD/MM/YYYY' };
      const value = service.formatShortDate(dayjs('2026-02-10'), culture);
      expect(value).toBe('10/02/2026');
    });

    it('should return empty string for invalid date', () => {
      const culture: UserCulture = { shortDateFormat: 'DD/MM/YYYY' };
      const value = service.formatShortDate(dayjs('invalid'), culture);
      expect(value).toBe('');
    });
  });

  describe('formatLongDate', () => {
    it('should format using culture long date format', () => {
      const culture: UserCulture = { longDateFormat: 'dddd, MMMM D, YYYY' };
      const value = service.formatLongDate(dayjs('2026-02-10'), culture);
      expect(value).toBe('Tuesday, February 10, 2026');
    });

    it('should return empty string for invalid date', () => {
      const culture: UserCulture = { longDateFormat: 'dddd, MMMM D, YYYY' };
      const value = service.formatLongDate(dayjs('invalid'), culture);
      expect(value).toBe('');
    });
  });
});
