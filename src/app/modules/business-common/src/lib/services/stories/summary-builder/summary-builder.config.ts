import { Validators } from '@angular/forms';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import {
  AutocompleteTypes,
  CheckboxGroupValidator,
  DateHelper,
  DayAgainstMonthAndYearValidator,
  RangeRequired,
  RfAppearanceTypes,
  RfFormBuilderFieldType,
  RfInputTypes,
  switchRequired,
} from 'reactive-forms';
import type {
  FormBuilderConfig,
  RfCheckboxOptionFormBuilder,
  RfListOption,
  RfRadioOptionFormBuilder,
  RfSelectDatePickerErrorMessages,
  RfSelectDatePickerMonths,
} from 'reactive-forms';
dayjs.extend(utc);

const getFlagUrl = (countryCode: string): string => `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
const getPrefixContentWithImg = (content: string, icon: string): string =>
  `<img role="presentation" src="${getFlagUrl(icon)}" alt="" width="24" height="18"><span>${content}</span>`;
const getAirlinesContentWithImg = (content: string, iconURL: string): string =>
  `<img role="presentation" src="${iconURL}" alt="" width="20" height="20"><span>${content}</span>`;

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

const SELECT_DATE_PICKER_MONTHS: RfSelectDatePickerMonths = buildMonthOptions('en');

const ERROR_MESSAGES_SELECT_DATE_PICKER: RfSelectDatePickerErrorMessages = {
  day: { required: 'The day is required' },
  month: { required: 'The month is required' },
  year: { required: 'The year is required' },
};

const RADIOS_CONFIG: RfRadioOptionFormBuilder[] = [
  { label: 'Radio Option 1', value: 'RADIO_1' },
  { label: 'Radio Option Readonly', value: 'RADIO_2', readonly: true },
  { label: 'Radio Option 3', value: 'RADIO_3' },
  { label: 'Radio Option Disabled', value: 'RADIO_4', disabled: true },
  { label: 'Radio Option 5', value: 'RADIO_5' },
];

const CHECKBOX_CONFIG: RfCheckboxOptionFormBuilder[] = [
  { label: 'Checkbox Option', value: 'CHECKBOX_1' },
  { label: 'Checkbox Option Checked', value: 'CHECKBOX_2', checked: true },
  { label: 'Checkbox Option Checked Readonly', value: 'CHECKBOX_3', checked: true, readonly: true },
  { label: 'Checkbox Option Readonly', value: 'CHECKBOX_4', readonly: true },
  { label: 'Checkbox Option Disabled', value: 'CHECKBOX_5', disabled: true },
];

const PREFIX_OPTIONS: RfListOption[] = [
  { value: '+34', content: getPrefixContentWithImg('+34 (Spain)', 'ES') },
  { value: '+57', content: getPrefixContentWithImg('+57 (Colombia)', 'CO') },
  { value: '+33', content: getPrefixContentWithImg('+33 (France)', 'FR') },
  { value: '+1', content: getPrefixContentWithImg('+1 (EEUU)', 'US') },
  { value: '+44', content: getPrefixContentWithImg('+44 (UK)', 'GB') },
];

const AA_OPTIONS: RfListOption[] = [
  {
    value: 'AV',
    content: getAirlinesContentWithImg(
      'Avianca',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzsfvuZTk_gRol9sRBxcYYHXt5rls-GQUiSA&s'
    ),
  },
  {
    value: 'AA',
    content: getAirlinesContentWithImg(
      'American Airlines',
      'https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/256x256/e3c27172642fbec0755db09067a127bf'
    ),
  },
  {
    value: 'VY',
    content: getAirlinesContentWithImg(
      'Vueling',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd7ibOxGsbGzLHz7YirKS9NY8gMaLx-BmbI5SmNtOzXH2Y9fj0_L1nRjdX9sdw-VivWLk&usqp=CAU'
    ),
  },
  {
    value: 'LH',
    content: getAirlinesContentWithImg(
      'Lufthansa',
      'https://static-00.iconduck.com/assets.00/lufthansa-icon-512x512-10xzvawo.png'
    ),
  },
  {
    value: 'TK',
    content: getAirlinesContentWithImg(
      'Turkish Airlines',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhP2j3goWiRn6b2FyBWtsX20G5zsKTi0JOoQ&s'
    ),
  },
];

const FLIGHT_CLASS_OPTIONS: RfListOption[] = [
  { value: 'economy', content: 'Economy Class' },
  { value: 'premium_economy', content: 'Premium Economy', disabled: true },
  { value: 'business', content: 'Business Class' },
  { value: 'first', content: 'First Class' },
];

const dateHelper = new DateHelper();

export const FORM_CONFIG_AFTER: FormBuilderConfig = {
  name: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'name',
    animatedLabel: 'Name',
    autocomplete: AutocompleteTypes.NAME,
    validators: [],
    disabled: true,
    value: 'Rigoberto',
  },
  surname: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'surname',
    animatedLabel: 'Surname',
    placeholder: 'Enter your surname',
    autocomplete: AutocompleteTypes.LAST_NAME,
    readonly: true,
    rightIcon: 'user',
    validators: [],
    value: 'Elaberto',
  },
  password: {
    type: RfFormBuilderFieldType.INPUT,
    inputType: RfInputTypes.PASSWORD,
    name: 'password',
    autocomplete: AutocompleteTypes.ON,
    animatedLabel: 'Password',
    validators: [Validators.required],
    value: '123456789',
  },
  email: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'email',
    animatedLabel: 'Email',
    placeholder: 'Enter your email',
    autocomplete: AutocompleteTypes.EMAIL,
    validators: [Validators.required, Validators.email],
    errorMessages: { required: 'Email is requiered' },
    value: 'test@flyr.com',
    blurInputText: (value: string): void => {
      console.log(value);
    },
    pasteInputText: (event: ClipboardEvent): void => {
      console.log('Paste captured', event);
    },
  },
  number: {
    type: RfFormBuilderFieldType.INPUT,
    inputType: RfInputTypes.RANGE,
    name: 'range',
    autocomplete: AutocompleteTypes.OFF,
    animatedLabel: 'Range',
    validators: [Validators.required],
    errorMessages: { required: 'Range is required' },
    value: '1',
  },
  number2: {
    type: RfFormBuilderFieldType.INPUT,
    inputType: RfInputTypes.RANGE,
    name: 'range2',
    autocomplete: AutocompleteTypes.OFF,
    animatedLabel: 'Range 2',
    validators: [Validators.required],
    errorMessages: { required: 'Range is required' },
    value: '1',
  },
  radios: {
    type: RfFormBuilderFieldType.RADIO,
    legend: 'Radios',
    radios: RADIOS_CONFIG,
    validators: [Validators.required],
  },
  checkboxes: {
    type: RfFormBuilderFieldType.CHECKBOX,
    legend: 'Checkboxes',
    checkboxes: CHECKBOX_CONFIG,
    validators: [CheckboxGroupValidator({ max: 2 })],
  },
  switch1: {
    type: RfFormBuilderFieldType.SWITCH,
    label: 'Switch 1',
    value: false,
    disabled: false,
    validators: [switchRequired({ requiredValue: true })],
  },
  phoneNumber: {
    type: RfFormBuilderFieldType.PREFIX_PHONE,
    phoneName: 'phoneNumber',
    autocompletePhone: AutocompleteTypes.PHONE,
    appearance: RfAppearanceTypes.INTEGRATED,
    title: 'Phone',
    animatedLabelPrefix: 'Prefix',
    animatedLabelPhone: 'Phone',
    placeholderPhone: 'Phone number here',
    maxLength: 5,
    options: PREFIX_OPTIONS,
    value: { prefix: '+1', phone: '789588745' },
    validators: {
      prefix: [Validators.required],
      phone: [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(5), Validators.maxLength(9)],
    },
    errorMessages: {
      phone: {
        required: 'Required field',
        minlength: 'Minimum length',
        maxlength: 'Maximum length',
        pattern: 'Only numbers',
      },
    },
    pasteInputText: (event: ClipboardEvent): void => {
      console.log('Paste captured', event);
    },
    ariaLabelledBy: { prefix: 'info-prefix-1', phone: 'info-phone-1' },
  },
  phoneNumber2: {
    type: RfFormBuilderFieldType.PREFIX_PHONE,
    phoneName: 'phoneNumber2',
    autocompletePhone: AutocompleteTypes.PHONE,
    appearance: RfAppearanceTypes.INTEGRATED,
    title: 'Phone Number 2',
    animatedLabelPrefix: 'Prefix',
    animatedLabelPhone: 'Phone',
    options: PREFIX_OPTIONS,
    value: { prefix: '+57', phone: '12345' },
    validators: {
      prefix: [Validators.required],
      phone: [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(5), Validators.maxLength(9)],
    },
    errorMessages: {
      phone: {
        required: 'Required field',
        minlength: 'Minimum length',
        maxlength: 'Maximum length',
        pattern: 'Only numbers',
      },
    },
    ariaLabelledBy: { prefix: 'info-prefix-1', phone: 'info-phone-1' },
  },
  flightClass: {
    type: RfFormBuilderFieldType.SELECT,
    options: FLIGHT_CLASS_OPTIONS,
    validators: [Validators.required],
    value: 'business',
    filter: { enabled: true, placeholder: 'Filter by flight class' },
    animatedLabel: 'Flight Class',
    placeholder: 'Select flight class',
    leftIcon: 'user',
    ariaLabelledBy: 'labelled-info',
  },
  airlines: {
    type: RfFormBuilderFieldType.SELECT,
    animatedLabel: 'Airlines',
    filter: { enabled: true, placeholder: 'Filter by airline' },
    options: AA_OPTIONS,
    validators: [Validators.required],
    value: 'VY',
    readonly: true,
    layout: { class: 'full-width' },
  },
  airlines2: {
    type: RfFormBuilderFieldType.LIST,
    options: AA_OPTIONS,
    readonly: true,
    validators: [Validators.required],
    value: 'VY',
  },
  selectDatePicker: {
    type: RfFormBuilderFieldType.SELECT_DATE_PICKER,
    value: dayjs().utc(),
    title: 'Select Datepicker',
    selectsLabels: {
      day: 'Day',
      month: 'Month',
      year: 'Year',
      months: SELECT_DATE_PICKER_MONTHS,
    },
    validators: {
      day: [Validators.required, DayAgainstMonthAndYearValidator()],
      month: [Validators.required],
      year: [Validators.required],
    },
    errorMessages: ERROR_MESSAGES_SELECT_DATE_PICKER,
    ariaLabelledBy: { day: 'day-1', month: 'month-1', year: 'year-1' },
  },
  datepicker: {
    type: RfFormBuilderFieldType.DATEPICKER,
    value: dayjs(),
    validators: [Validators.required],
    classes: {
      calendar: 'custom-calendar-class',
    },
  },
  inputdatepicker: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker',
    value: dayjs(),
    validators: [Validators.required],
    rightIcon: 'calendar',
    hideCaret: true,
  },
  inputdatepickerrange: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker Range',
    value: { startDate: dateHelper.utcDayJs(2025, 22, 4), endDate: dateHelper.utcDayJs(2025, 4, 25) },
    validators: [Validators.required, RangeRequired()],
    rangeEnabled: true,
    ariaLabelledBy: 'labelled-info',
  },
};
