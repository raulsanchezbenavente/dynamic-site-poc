import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ShortDate } from '../../../common/short-date.interface';

import { getDaysInMonth } from './common-validators-fn';

/**
 * Validator function to check if a ShortDate value is valid.
 * Validates year, month, and day properties.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function RequiredDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string') {
      return null;
    }

    if (!value || typeof value !== 'object') {
      console.warn('check type of value');
      return null;
    }

    // Check if it's a ShortDate object
    if (!('year' in value && 'month' in value && 'day' in value)) {
      return { invalidDate: true };
    }

    const date = (value as ShortDate).day;
    const month = (value as ShortDate).month;
    const year = (value as ShortDate).year;

    if (!date || !month || !year) {
      return { invalidDate: true };
    }

    if (month && (month < 1 || month > 12)) {
      return { invalidDate: true };
    }

    if (date && (date < 1 || date > 31)) {
      return { invalidDate: true };
    }

    if (year && (year.toString().length !== 4 || year < 1)) {
      return { invalidDate: true };
    }

    if (date && month && year) {
      const daysInMonth = getDaysInMonth(month, year);

      if (date > daysInMonth) {
        return { invalidDate: true };
      }
    }

    return null;
  };
}
