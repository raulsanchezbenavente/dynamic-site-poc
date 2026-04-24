import { Injectable } from '@angular/core';
import type { Dayjs } from 'dayjs';

import { NameOrder, TextDirection } from '../../enums';
import { UserCulture } from '../../models';

import {
  LAST_FIRST_LANGUAGES,
  LAST_FIRST_REGIONS,
  LOCALE_TO_CURRENCY,
  RTL_LANGUAGES,
  RTL_SCRIPTS,
} from './default-cultures.constants';

@Injectable({ providedIn: 'root' })
export class CultureHelperService {
  public getShortDateFormat(localeISObcp47: string): string {
    const dtf = new Intl.DateTimeFormat(localeISObcp47, { day: '2-digit', month: '2-digit', year: 'numeric' });
    return dtf
      .formatToParts(0)
      .map((p) => {
        let token = p.value;
        if (p.type === 'day') {
          token = 'DD';
        } else if (p.type === 'month') {
          token = 'MM';
        } else if (p.type === 'year') {
          token = 'YYYY';
        }
        return token;
      })
      .join('');
  }

  public getLongDateFormat(localeISObcp47: string): string {
    const dtf = new Intl.DateTimeFormat(localeISObcp47, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return dtf
      .formatToParts(0)
      .map((p) => {
        let token = p.value;
        if (p.type === 'weekday') {
          token = 'dddd';
        } else if (p.type === 'day') {
          token = 'D';
        } else if (p.type === 'month') {
          token = 'MMMM';
        } else if (p.type === 'year') {
          token = 'YYYY';
        }
        return token;
      })
      .join('');
  }

  public getTimeFormat(localeISObcp47: string): string {
    const dtf = new Intl.DateTimeFormat(localeISObcp47, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: undefined,
    });
    const use12h = dtf.resolvedOptions().hour12 === true;
    return dtf
      .formatToParts(0)
      .map((p) => {
        let token = p.value;
        if (p.type === 'hour') {
          token = use12h ? 'hh' : 'HH';
        } else if (p.type === 'minute') {
          token = 'mm';
        } else if (p.type === 'dayPeriod') {
          token = 'A';
        }
        return token;
      })
      .join('');
  }

  public is24HourFormat(localeISObcp47: string): boolean {
    const dtf = new Intl.DateTimeFormat(localeISObcp47, { hour: '2-digit', minute: '2-digit', hour12: undefined });
    return dtf.resolvedOptions().hour12 !== true;
  }

  public getFirstDayOfWeek(localeISObcp47: string): number {
    const locale = new Intl.Locale(localeISObcp47);
    const firstDay = (locale as unknown as { weekInfo?: { firstDay?: number } }).weekInfo?.firstDay;
    if (typeof firstDay === 'number') {
      return firstDay;
    }

    const region = locale.region?.toUpperCase();
    if (region === 'US' || region === 'CA' || region === 'PH') {
      return 7; // Sunday
    }

    return 1; // Monday (default)
  }

  public getDecimalSeparator(localeISObcp47: string): string {
    const parts = new Intl.NumberFormat(localeISObcp47).formatToParts(1.1);
    const decimal = parts.find((p) => p.type === 'decimal')?.value;
    return decimal ?? '.';
  }

  public getThousandsSeparator(localeISObcp47: string): string {
    const parts = new Intl.NumberFormat(localeISObcp47).formatToParts(1000);
    const group = parts.find((p) => p.type === 'group')?.value;
    return group ?? ',';
  }

  public getNameOrder(localeISObcp47: string): NameOrder {
    const locale = new Intl.Locale(localeISObcp47);
    const language = locale.language?.toLowerCase();
    const region = locale.region?.toUpperCase();
    if (LAST_FIRST_LANGUAGES.has(language) || (region && LAST_FIRST_REGIONS.has(region))) {
      return NameOrder.LAST_FIRST;
    }
    return NameOrder.FIRST_LAST;
  }

  public getDirection(localeISObcp47: string): TextDirection {
    const locale = new Intl.Locale(localeISObcp47);
    const language = locale.language?.toLowerCase();
    const script = locale.script?.toLowerCase();
    if ((language && RTL_LANGUAGES.has(language)) || (script && RTL_SCRIPTS.has(script))) {
      return TextDirection.RIGHT_TO_LEFT;
    }
    return TextDirection.LEFT_TO_RIGHT;
  }

  public getCurrencyFromLocale(locale: string): string {
    return LOCALE_TO_CURRENCY[locale] ?? LOCALE_TO_CURRENCY[locale.split('-')[0]] ?? 'USD';
  }

  public formatNumber(value: number, culture: UserCulture): string {
    return new Intl.NumberFormat(culture.locale).format(value);
  }

  public formatShortDate(date: Dayjs, culture: UserCulture): string {
    if (!date?.isValid()) {
      return '';
    }
    const format = culture?.shortDateFormat ?? 'YYYY-MM-DD';
    return date.format(format);
  }

  public formatLongDate(date: Dayjs, culture: UserCulture): string {
    if (!date?.isValid()) {
      return '';
    }
    const format = culture?.longDateFormat ?? 'dddd, MMMM D, YYYY';
    return date.format(format);
  }
}
