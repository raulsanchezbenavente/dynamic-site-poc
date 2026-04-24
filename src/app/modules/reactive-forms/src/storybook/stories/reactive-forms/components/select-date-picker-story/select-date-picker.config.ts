import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

import type { RfSelectDatePickerClases } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-classes.model';
import type { RfSelectDatePickerErrorMessages } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-error-messages.model';
import type { RfSelectDatePickerHintMessages } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-hint-messages.model';
import type {
  RfSelectDatePickerMonths,
  RfSelectDatePickerOptionsData,
} from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-months.model';

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

const buildMonthOptions = (locale?: string): RfSelectDatePickerMonths =>
  MONTH_KEYS.reduce((acc, key, index) => {
    acc[key] = locale ? dayjs().locale(locale).month(index).format('MMMM') : dayjs().month(index).format('MMMM');
    return acc;
  }, {} as RfSelectDatePickerMonths);

export const ERROR_MESSAGES_SELECT_DATE_PICKER: RfSelectDatePickerErrorMessages = {
  day: {
    required: 'The day is required',
  },
  month: {
    required: 'The month is required',
  },
  year: {
    required: 'The year is required',
  },
};

export const UNIFIED_ERROR_MESSAGES_SELECT_DATE_PICKER: RfSelectDatePickerErrorMessages = {
  day: {
    required: 'The date is incomplete. Please fill in all required fields.',
  },
  month: {
    required: 'The date is incomplete. Please fill in all required fields.',
  },
  year: {
    required: 'The date is incomplete. Please fill in all required fields.',
  },
};

export const HINT_MESSAGES_GENERAL_SELECT_DATE_PICKER: RfSelectDatePickerHintMessages = {
  general: 'Select a valid date',
};

export const HINT_MESSAGES_SPECIFIC_SELECT_DATE_PICKER: RfSelectDatePickerHintMessages = {
  specific: {
    day: 'Select a valid day',
    month: 'Select a valid month',
    year: 'Select a valid year',
  },
};

export const DATE_PICKER_CUSTOM_CLASSES: RfSelectDatePickerClases = {
  title: 'fs-2 fw-bold',
  day: {
    button: 'fw-bold fs-2',
    containerItemSelected: 'custom-height',
    list: { option: 'fs-2 fw-bold bg-success text-danger' },
  },
  month: {
    button: 'fw-bold fs-2',
    containerItemSelected: 'custom-height',
    list: { option: 'fs-2 fw-bold bg-success text-danger' },
  },
  year: {
    button: 'fw-bold fs-2',
    containerItemSelected: 'custom-height',
    list: { option: 'fs-2 fw-bold bg-success text-danger' },
  },
  errorMessages: { message: 'fs-2 fw-bold text-warning' },
};

export const SELECT_DATE_PICKER_MONTHS: RfSelectDatePickerMonths = buildMonthOptions('en');
export const SELECT_DATE_PICKER_MONTHS_CUSTOM: RfSelectDatePickerMonths = buildMonthOptions('fr');

export const SELECT_LABEL_VALUES: RfSelectDatePickerOptionsData = {
  day: 'Day',
  month: 'Month',
  year: 'Year',
  months: SELECT_DATE_PICKER_MONTHS,
};

export const CUSTOM_SELECT_LABEL_VALUES: RfSelectDatePickerOptionsData = {
  day: 'CsDay',
  month: 'CsMonth',
  year: 'CsYear',
  months: SELECT_DATE_PICKER_MONTHS_CUSTOM,
};
