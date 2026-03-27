import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import dayjs from 'dayjs';

export function RangeRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || typeof value !== 'object') {
      return { invalidDateRange: true };
    }

    const { startDate, endDate } = value;

    if (!dayjs.isDayjs(startDate) || !dayjs.isDayjs(endDate)) {
      return { invalidDateRange: true };
    }

    if (!startDate.isValid() || !endDate.isValid()) {
      return { invalidDateRange: true };
    }

    if (startDate.isAfter(endDate)) {
      return { invalidDateRange: true };
    }

    return null;
  };
}
