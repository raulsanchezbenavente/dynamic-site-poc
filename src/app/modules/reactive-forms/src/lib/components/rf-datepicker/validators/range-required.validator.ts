import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ShortDate } from '../../../common/short-date.interface';

/**
 * Checks if a value is a valid ShortDate object.
 */
function isValidShortDate(date: unknown): date is ShortDate {
  if (!date || typeof date !== 'object') {
    return false;
  }
  const d = date as ShortDate;
  return (
    typeof d.year === 'number' &&
    typeof d.month === 'number' &&
    typeof d.day === 'number' &&
    d.year > 0 &&
    d.month >= 1 &&
    d.month <= 12 &&
    d.day >= 1 &&
    d.day <= 31
  );
}

/**
 * Compares two ShortDate objects.
 * Returns true if startDate is after endDate.
 */
function isAfter(startDate: ShortDate, endDate: ShortDate): boolean {
  if (startDate.year !== endDate.year) {
    return startDate.year > endDate.year;
  }
  if (startDate.month !== endDate.month) {
    return startDate.month > endDate.month;
  }
  return startDate.day > endDate.day;
}

/**
 * Validator function to check if a date range (with ShortDate start and end) is valid.
 * Validates that both dates exist, are valid, and startDate is before or equal to endDate.
 */
export function RangeRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || typeof value !== 'object') {
      return { invalidDateRange: true };
    }

    const { startDate, endDate } = value;

    if (!isValidShortDate(startDate) || !isValidShortDate(endDate)) {
      return { invalidDateRange: true };
    }

    if (isAfter(startDate, endDate)) {
      return { invalidDateRange: true };
    }

    return null;
  };
}
