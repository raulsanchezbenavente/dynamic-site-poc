import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import dayjs from 'dayjs';

export function DayAgainstMonthAndYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const dayValue = form.get('day')?.value;
    const monthValue = form.get('month')?.value;
    let yearValue = form.get('year')?.value;
    yearValue ??= dayjs().year();

    const daysInMonth = dayjs.utc(`${yearValue}-${monthValue}`, 'YYYY-M').daysInMonth();

    if (dayValue > daysInMonth) {
      return {
        invalidDay: {
          day: dayValue,
          month: monthValue,
          year: yearValue,
          maxDay: daysInMonth,
        },
      };
    }

    return null;
  };
}

export function FutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const dayValue = form.get('day')?.value;
    const monthValue = form.get('month')?.value;
    const yearValue = form.get('year')?.value;

    if (!dayValue || !monthValue || !yearValue) return null;

    const selectedDate = dayjs(`${yearValue}-${monthValue}-${dayValue}`);
    const today = dayjs();
    if (today.isAfter(selectedDate)) {
      return {
        invalidFutureDate: {
          day: dayValue,
          month: monthValue,
          year: yearValue,
        },
      };
    }

    return null;
  };
}
