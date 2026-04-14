import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ShortDate } from '../../../common/short-date.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function SpecificDate(specificDate: string): ValidatorFn {
  const [day, month, year] = specificDate.split('/').map(Number);
  const targetDate: ShortDate = {
    day,
    month,
    year,
  };

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as ShortDate | undefined;
    if (!value) {
      return null;
    }

    if (value.year === targetDate.year && value.month === targetDate.month && value.day === targetDate.day) {
      return null;
    }

    return { invalidSpecificDate: `${specificDate}.` };
  };
}
