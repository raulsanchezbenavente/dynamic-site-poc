import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Dayjs } from 'dayjs';

import { getDaysInMonth } from './common-validators-fn';

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

    const date = (value as Dayjs).date();
    const month = (value as Dayjs).month() + 1;
    const year = (value as Dayjs).year();

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
