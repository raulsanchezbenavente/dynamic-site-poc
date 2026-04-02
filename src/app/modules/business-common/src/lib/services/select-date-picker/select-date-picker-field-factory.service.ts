import { inject, Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import {
  DayAgainstMonthAndYearValidator,
  RfAppearanceTypes,
  RfFormBuilderFieldType,
  type RfSelectDatePickerField,
  type RfSelectDatePickerMonths,
  type RfSelectDatePickerOptionsData,
} from 'reactive-forms';

import { SELECT_DATE_PICKER_MONTH_ABBREVIATION } from './select-date-picker-month-abbreviation.config';

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

@Injectable({ providedIn: 'root' })
export class RfSelectDatePickerFieldFactoryService {
  private readonly translateService = inject(TranslateService);

  private readonly baseConfig: RfSelectDatePickerField;

  constructor() {
    this.baseConfig = this.buildBaseConfig();
  }

  public create(overrides: Partial<RfSelectDatePickerField> = {}): RfSelectDatePickerField {
    const base = this.baseConfig;

    const selectsLabels: RfSelectDatePickerOptionsData | undefined = overrides['selectsLabels']
      ? { ...base.selectsLabels!, ...overrides['selectsLabels'] }
      : base.selectsLabels;

    const validators = overrides['validators'] ? { ...base.validators, ...overrides['validators'] } : base.validators;

    const errorMessages = overrides['errorMessages']
      ? { ...base.errorMessages, ...overrides['errorMessages'] }
      : base.errorMessages;

    return {
      ...base,
      ...overrides,
      selectsLabels,
      validators,
      errorMessages,
    };
  }

  private buildBaseConfig(): RfSelectDatePickerField {
    return {
      type: RfFormBuilderFieldType.SELECT_DATE_PICKER,
      value: null,
      appearance: RfAppearanceTypes.INTEGRATED,
      separatedErrors: false,
      selectsLabels: this.buildSelectDatePickerTexts(),
      validators: {
        day: [Validators.required, DayAgainstMonthAndYearValidator()],
        month: [Validators.required],
        year: [Validators.required],
      },
      errorMessages: {},
      abbreviationMonth: SELECT_DATE_PICKER_MONTH_ABBREVIATION,
    };
  }

  private buildSelectDatePickerTexts(): RfSelectDatePickerOptionsData {
    const locale = this.getCurrentLocale();

    return {
      day: this.translateService.instant('Common.LabelDay'),
      month: this.translateService.instant('Common.LabelMonth'),
      year: this.translateService.instant('Common.LabelYear'),
      months: this.buildMonthOptions(locale),
    };
  }

  private getCurrentLocale(): string {
    return this.translateService.getCurrentLang?.() || (this.translateService as any).defaultLang || 'en';
  }

  private buildMonthOptions(locale: string): RfSelectDatePickerMonths {
    return MONTH_KEYS.reduce((acc, key, index) => {
      const month = dayjs().locale(locale).month(index).format('MMMM');
      acc[key] = this.capitalizeFirstLetter(month, locale);
      return acc;
    }, {} as RfSelectDatePickerMonths);
  }

  private capitalizeFirstLetter(value: string, locale: string): string {
    if (!value) return value;
    const first = value[0].toLocaleUpperCase(locale);
    return `${first}${value.slice(1)}`;
  }
}
