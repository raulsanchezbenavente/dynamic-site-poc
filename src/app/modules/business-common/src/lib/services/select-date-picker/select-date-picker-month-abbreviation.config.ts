import type { SafeHtml } from '@angular/platform-browser';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import type { MonthAbbreviationConfig } from 'reactive-forms';

const ABBREVIATION_LOCALES = ['en', 'es', 'fr', 'pt'] as const;

export const SELECT_DATE_PICKER_MONTH_ABBREVIATION: MonthAbbreviationConfig = {
  threshold: 380,
  mask: (data: SafeHtml): SafeHtml => {
    const monthLabel = normalizeMonthLabel(data);
    if (!monthLabel) {
      return data;
    }

    for (const locale of ABBREVIATION_LOCALES) {
      const months = Array.from({ length: 12 }, (_value, index) =>
        dayjs().locale(locale).month(index).format('MMMM').toLowerCase()
      );
      const monthIndex = months.indexOf(monthLabel);
      if (monthIndex !== -1) {
        return capitalizeFirstLetter(dayjs().locale(locale).month(monthIndex).format('MMM'), locale);
      }
    }

    return data;
  },
};

function normalizeMonthLabel(data: SafeHtml): string | null {
  if (typeof data === 'string') {
    return data.trim().toLowerCase();
  }

  if (data && typeof data === 'object' && 'changingThisBreaksApplicationSecurity' in data) {
    const raw = (data as { changingThisBreaksApplicationSecurity?: string }).changingThisBreaksApplicationSecurity;
    return raw ? raw.trim().toLowerCase() : null;
  }

  if (typeof data === 'object') {
    return null;
  }

  return String(data).trim().toLowerCase();
}

function capitalizeFirstLetter(value: string, locale?: string): string {
  if (!value) return value;
  const first = locale ? value[0].toLocaleUpperCase(locale) : value[0].toUpperCase();
  return `${first}${value.slice(1)}`;
}
