import { Injectable } from '@angular/core';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ShortDate } from '../common/short-date.interface';

dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class DateHelper {
  public formatDateToYYYYMMDD(date: Dayjs): string {
    return date.format('YYYYMMDD');
  }

  public fromNgbDateToUTCDate(date: NgbDate): Dayjs {
    const dayjsDate = dayjs
      .utc()
      .year(date.year)
      .month(date.month - 1)
      .date(date.day);

    return dayjsDate;
  }

  public fromDateToNgbDate(date: Dayjs): NgbDate {
    return new NgbDate(date.year(), date.month() + 1, date.date());
  }

  public padZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  public formatNgbDate(date: NgbDateStruct): string {
    return `${this.padZero(date.day)}/${this.padZero(date.month)}/${date.year}`;
  }

  public compareDates(a: NgbDateStruct, b: NgbDateStruct): number {
    if (a.year !== b.year) {
      return a.year < b.year ? -1 : 1;
    }
    if (a.month !== b.month) {
      return a.month < b.month ? -1 : 1;
    }
    if (a.day !== b.day) {
      return a.day < b.day ? -1 : 1;
    }
    return 0;
  }

  public utcDayJs(year: number, month: number, day: number): Dayjs {
    return dayjs
      .utc()
      .year(year)
      .month(month - 1)
      .date(day);
  }

  public parseNaiveLocal(input: string): Dayjs {
    const clean = input.replace(/\sGMT[^\s)]+(?:\s+\([^)]*\))?$/, '');
    return dayjs(clean, 'ddd MMM DD YYYY HH:mm:ss', true);
  }

  public parseNaiveUtc(input: string): Dayjs {
    const d = this.parseNaiveLocal(input);
    return dayjs
      .utc()
      .year(d.year())
      .month(d.month())
      .date(d.date())
      .hour(d.hour())
      .minute(d.minute())
      .second(d.second())
      .millisecond(d.millisecond());
  }

  /**
   * Converts NgbDate to ShortDate format.
   */
  public fromNgbDateToShortDate(date: NgbDate): ShortDate {
    return {
      year: date.year,
      month: date.month,
      day: date.day,
    };
  }

  /**
   * Converts ShortDate to NgbDate.
   */
  public fromShortDateToNgbDate(date: ShortDate): NgbDate {
    return new NgbDate(date.year, date.month, date.day);
  }

  /**
   * Creates a ShortDate from year, month, and day values.
   */
  public createShortDate(year: number, month: number, day: number): ShortDate {
    return { year, month, day };
  }

  /**
   * Gets today's date as ShortDate in UTC.
   */
  public todayAsShortDate(): ShortDate {
    const today = dayjs.utc();
    return {
      year: today.year(),
      month: today.month() + 1, // dayjs months are 0-indexed
      day: today.date(),
    };
  }

  /**
   * Converts a ShortDate to an ISO 8601 UTC string (e.g. "2035-03-24T00:00:00.000Z").
   */
  public fromShortDateToISOString(date: ShortDate): string {
    return dayjs
      .utc()
      .year(date.year)
      .month(date.month - 1)
      .date(date.day)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();
  }
}
