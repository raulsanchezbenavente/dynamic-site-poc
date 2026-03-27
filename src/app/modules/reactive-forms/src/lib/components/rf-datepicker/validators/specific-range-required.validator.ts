import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import dayjs from 'dayjs';

export function SpecificDateRange(StartDateRange: string, EndDateRange: string): ValidatorFn {
  const [minDay, minMonth, minYear] = StartDateRange.split('/').map(Number);
  const [maxDay, maxMonth, maxYear] = EndDateRange.split('/').map(Number);

  const specificStartDateRange = dayjs()
    .year(minYear)
    .month(minMonth - 1)
    .date(minDay)
    .startOf('day');
  const specificEndDateRange = dayjs()
    .year(maxYear)
    .month(maxMonth - 1)
    .date(maxDay)
    .endOf('day');

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const { startDate, endDate } = value;

    if (!dayjs.isDayjs(startDate) || !dayjs.isDayjs(endDate)) {
      return { invalidSpecificDateRange: `${StartDateRange} - ${EndDateRange}` };
    }

    const normalizedStart = startDate.startOf('day');
    const normalizedEnd = endDate.startOf('day');

    if (normalizedStart.isBefore(specificStartDateRange)) {
      return { specificStartDateRange: `${StartDateRange}` };
    }

    if (normalizedEnd.isAfter(specificEndDateRange)) {
      return { specificEndDateRange: `${EndDateRange}` };
    }

    return null;
  };
}
