import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ShortDate } from '../../../common/short-date.interface';

function compareDates(date1: ShortDate, date2: ShortDate): number {
  if (date1.year !== date2.year) return date1.year - date2.year;
  if (date1.month !== date2.month) return date1.month - date2.month;
  return date1.day - date2.day;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function SpecificDateRange(StartDateRange: string, EndDateRange: string): ValidatorFn {
  const [minDay, minMonth, minYear] = StartDateRange.split('/').map(Number);
  const [maxDay, maxMonth, maxYear] = EndDateRange.split('/').map(Number);

  const specificStartDateRange: ShortDate = {
    day: minDay,
    month: minMonth,
    year: minYear,
  };
  const specificEndDateRange: ShortDate = {
    day: maxDay,
    month: maxMonth,
    year: maxYear,
  };

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const { startDate, endDate } = value as { startDate?: ShortDate; endDate?: ShortDate };

    if (!startDate || !endDate) {
      return { invalidSpecificDateRange: `${StartDateRange} - ${EndDateRange}` };
    }

    if (compareDates(startDate, specificStartDateRange) < 0) {
      return { specificStartDateRange: `${StartDateRange}` };
    }

    if (compareDates(endDate, specificEndDateRange) > 0) {
      return { specificEndDateRange: `${EndDateRange}` };
    }

    return null;
  };
}
