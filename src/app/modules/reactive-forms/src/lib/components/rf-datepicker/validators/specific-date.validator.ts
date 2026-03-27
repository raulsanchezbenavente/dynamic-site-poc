import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import dayjs from 'dayjs';

export function SpecificDate(specificDate: string): ValidatorFn {
  const [date, month, year] = specificDate.split('/').map(Number);
  const specificDateDate = dayjs()
    .date(date)
    .month(month - 1)
    .year(year)
    .startOf('day');

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    if (dayjs.isDayjs(value)) {
      if (
        value.year() === specificDateDate.year() &&
        value.month() === specificDateDate.month() &&
        value.date() === specificDateDate.date()
      ) {
        return null;
      } else {
        return { invalidSpecificDate: `${specificDate}.` };
      }
    }

    return { invalidSpecificDate: `${specificDate}.` };
  };
}
