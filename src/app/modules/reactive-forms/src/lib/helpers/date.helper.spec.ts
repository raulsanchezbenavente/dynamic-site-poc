import { TestBed } from '@angular/core/testing';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DateHelper } from './date.helper';

dayjs.extend(utc);

describe('DateHelper', () => {
  let svc: DateHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateHelper],
    });
    svc = TestBed.inject(DateHelper);
  });

  describe('formatDateToYYYYMMDD', () => {
    it('should format day and month with leading zeros', () => {
      const d = dayjs.utc().year(2023).month(0).date(5); // 2023-01-05
      expect(svc.formatDateToYYYYMMDD(d)).toBe('20230105');
    });

    it('should format a two-digit date without losing zeros', () => {
      const d = dayjs.utc().year(1999).month(10).date(10); // 1999-11-10
      expect(svc.formatDateToYYYYMMDD(d)).toBe('19991110');
    });
  });

  describe('fromNgbDateToUTCDate', () => {
    it('should correctly convert from NgbDate (1-based month) to Dayjs UTC', () => {
      const ngb = new NgbDate(2025, 3, 9); // March 9, 2025
      const dj = svc.fromNgbDateToUTCDate(ngb);
      expect(dj.utcOffset()).toBe(0); // UTC
      expect(dj.year()).toBe(2025);
      expect(dj.month()).toBe(2); // 0-based -> March is 2
      expect(dj.date()).toBe(9);
      expect(dj.format('YYYY-MM-DD')).toBe('2025-03-09');
    });

    it('should handle a leap day', () => {
      const ngb = new NgbDate(2024, 2, 29);
      const dj = svc.fromNgbDateToUTCDate(ngb);
      expect(dj.format('YYYY-MM-DD')).toBe('2024-02-29');
    });
  });

  describe('fromDateToNgbDate', () => {
    it('should convert Dayjs UTC to NgbDate (1-based month)', () => {
      const d = dayjs.utc('2025-12-01');
      const ngb = svc.fromDateToNgbDate(d);
      expect(ngb.year).toBe(2025);
      expect(ngb.month).toBe(12); // 1-based
      expect(ngb.day).toBe(1);
    });
  });

  describe('padZero', () => {
    it('should add leading zero when < 10', () => {
      expect(svc.padZero(0)).toBe('00');
      expect(svc.padZero(7)).toBe('07');
      expect(svc.padZero(9)).toBe('09');
    });
    it('should return as is when >= 10', () => {
      expect(svc.padZero(10)).toBe('10');
      expect(svc.padZero(31)).toBe('31');
    });
  });

  describe('formatNgbDate', () => {
    it('should format to dd/MM/yyyy with zeros', () => {
      const d: NgbDateStruct = { year: 2020, month: 1, day: 5 };
      expect(svc.formatNgbDate(d)).toBe('05/01/2020');
    });
    it('should correctly format two-digit values', () => {
      const d: NgbDateStruct = { year: 2031, month: 11, day: 23 };
      expect(svc.formatNgbDate(d)).toBe('23/11/2031');
    });
  });

  describe('compareDates', () => {
    it('should return 0 when dates are equal', () => {
      const a: NgbDateStruct = { year: 2022, month: 6, day: 15 };
      const b: NgbDateStruct = { year: 2022, month: 6, day: 15 };
      expect(svc.compareDates(a, b)).toBe(0);
    });

    it('should sort by year, then month, then day', () => {
      const base: NgbDateStruct = { year: 2023, month: 5, day: 10 };

      expect(svc.compareDates({ year: 2022, month: 12, day: 31 }, base)).toBe(-1);
      expect(svc.compareDates({ year: 2024, month: 1, day: 1 }, base)).toBe(1);

      expect(svc.compareDates({ year: 2023, month: 4, day: 20 }, base)).toBe(-1);
      expect(svc.compareDates({ year: 2023, month: 6, day: 1 }, base)).toBe(1);

      expect(svc.compareDates({ year: 2023, month: 5, day: 9 }, base)).toBe(-1);
      expect(svc.compareDates({ year: 2023, month: 5, day: 11 }, base)).toBe(1);
    });
  });

  describe('utcDayJs', () => {
    it('should create a Dayjs in UTC with 1-based month', () => {
      const d: Dayjs = svc.utcDayJs(2021, 7, 14);
      expect(d.utcOffset()).toBe(0);
      expect(d.year()).toBe(2021);
      expect(d.month()).toBe(6); // July => 6 (0-based)
      expect(d.date()).toBe(14);
      expect(d.format('YYYY-MM-DD')).toBe('2021-07-14');
    });
  });

  describe('parseNaiveLocal', () => {
    it('should ignore GMT offset and keep raw date/time fields', () => {
      const input =
        'Tue Jan 30 2074 16:00:00 GMT+0100 (Central European Standard Time)';

      const result = svc.parseNaiveLocal(input);

      expect(result.isValid()).toBeTrue();
      expect(result.year()).toBe(2074);
      expect(result.month()).toBe(0); // January
      expect(result.date()).toBe(30);
      expect(result.hour()).toBe(16);
      expect(result.minute()).toBe(0);
      expect(result.second()).toBe(0);
    });

    it('should behave the same regardless of the GMT offset in the input', () => {
      const base = 'Tue Jan 30 2074 16:00:00';
      const input1 = `${base} GMT+0100 (Central European Standard Time)`;
      const input2 = `${base} GMT+0200 (Eastern European Time)`;

      const r1 = svc.parseNaiveLocal(input1);
      const r2 = svc.parseNaiveLocal(input2);

      expect(r1.isValid()).toBeTrue();
      expect(r2.isValid()).toBeTrue();

      expect(r1.year()).toBe(2074);
      expect(r1.year()).toBe(r2.year());
      expect(r1.month()).toBe(r2.month());
      expect(r1.date()).toBe(r2.date());
      expect(r1.hour()).toBe(r2.hour());
      expect(r1.minute()).toBe(r2.minute());
      expect(r1.second()).toBe(r2.second());
    });
  });

  describe('parseNaiveUtc', () => {
    it('should return a UTC date with the same components as parseNaiveLocal', () => {
      const input =
        'Tue Jan 30 2074 16:00:00 GMT+0100 (Central European Standard Time)';

      const local = svc.parseNaiveLocal(input);
      const utcResult = svc.parseNaiveUtc(input);

      expect(utcResult.isValid()).toBeTrue();

      expect(utcResult.utcOffset()).toBe(0);

      expect(utcResult.year()).toBe(local.year());
      expect(utcResult.month()).toBe(local.month());
      expect(utcResult.date()).toBe(local.date());
      expect(utcResult.hour()).toBe(local.hour());
      expect(utcResult.minute()).toBe(local.minute());
      expect(utcResult.second()).toBe(local.second());
      expect(utcResult.millisecond()).toBe(local.millisecond());
    });

    it('should ignore any GMT offset in the input and normalize to the same UTC instant', () => {
      const base = 'Tue Jan 30 2074 16:00:00';
      const input1 = `${base} GMT+0100 (Central European Standard Time)`;
      const input2 = `${base} GMT+0200 (Eastern European Time)`;

      const r1 = svc.parseNaiveUtc(input1);
      const r2 = svc.parseNaiveUtc(input2);

      expect(r1.isValid()).toBeTrue();
      expect(r2.isValid()).toBeTrue();

      expect(r1.utcOffset()).toBe(0);
      expect(r2.utcOffset()).toBe(0);

      expect(r1.year()).toBe(2074);
      expect(r2.year()).toBe(2074);

      expect(r1.month()).toBe(0);
      expect(r2.month()).toBe(0);

      expect(r1.date()).toBe(30);
      expect(r2.date()).toBe(30);

      expect(r1.hour()).toBe(16);
      expect(r2.hour()).toBe(16);

      expect(r1.minute()).toBe(0);
      expect(r2.minute()).toBe(0);

      expect(r1.second()).toBe(0);
      expect(r2.second()).toBe(0);
    });
  });
});
