import { Validators } from '@angular/forms';
import dayjs from 'dayjs';

import { RfAppearanceTypes } from '../../../../../lib/abstract/enums/rf-base-reactive-appearance.enum';
import { CheckboxGroupValidator } from '../../../../../lib/components/rf-checkbox/validators/rf-checkbox.validators';
import { RangeRequired } from '../../../../../lib/components/rf-datepicker/validators/range-required.validator';
import { AutocompleteTypes } from '../../../../../lib/components/rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import { DayAgainstMonthAndYearValidator } from '../../../../../lib/components/rf-select-date-picker/validators/rf-select-date-picker-incorrect-day.validator';
import { switchRequired } from '../../../../../lib/components/rf-switch/validators/rf-switch-validators';
import { RfFormBuilderFieldType } from '../../../../../lib/form-builder/enums/rf-form-builder.types.enum';
import type {
  RfCheckboxOptionFormBuilder,
  RfRadioOptionFormBuilder,
} from '../../../../../lib/form-builder/models/rf-form-builder.model';
import type { FormBuilderConfig } from '../../../../../lib/form-builder/types/rf-form-builder-config.type';
import { DateHelper } from '../../../../../lib/helpers/date.helper';
import { AA_OPTIONS, FLIGHT_CLASS_OPTIONS, PREFIX_OPTIONS } from '../../components/list-story/list.config';
import {
  ERROR_MESSAGES_SELECT_DATE_PICKER,
  SELECT_DATE_PICKER_MONTHS,
} from '../../components/select-date-picker-story/select-date-picker.config';

const dateHelper = new DateHelper();

export const RADIOS_CONFIG: RfRadioOptionFormBuilder[] = [
  {
    label: 'Radio Option 1',
    value: 'RADIO_1',
  },
  {
    label: 'Radio Option Readonly',
    value: 'RADIO_2',
    readonly: true,
  },
  {
    label: 'Radio Option 3',
    value: 'RADIO_3',
  },
  {
    label: 'Radio Option Disabled',
    value: 'RADIO_4',
    disabled: true,
  },
  {
    label: 'Radio Option 5',
    value: 'RADIO_5',
  },
];

export const CHECKBOX_CONFIG: RfCheckboxOptionFormBuilder[] = [
  {
    label: 'Checkbox Option',
    value: 'CHECKBOX_1',
  },
  {
    label: 'Checkbox Option Checked',
    value: 'CHECKBOX_2',
    checked: true,
  },
  {
    label: 'Checkbox Option Checked Readonly',
    value: 'CHECKBOX_3',
    checked: true,
    readonly: true,
  },
  {
    label: 'Checkbox Option Readonly',
    value: 'CHECKBOX_4',
    readonly: true,
  },
  {
    label: 'Checkbox Option Disabled',
    value: 'CHECKBOX_5',
    disabled: true,
  },
];

export const FORM_CONFIG: FormBuilderConfig = {
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
    animatedLabel: 'Password',
    autocomplete: AutocompleteTypes.ON,
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
  },
  number: {
    type: RfFormBuilderFieldType.INPUT,
    inputType: RfInputTypes.RANGE,
    name: 'range',
    autocomplete: AutocompleteTypes.OFF,
    animatedLabel: 'Range',
    validators: [Validators.required],
    errorMessages: { required: 'Range is required' },
    value: '75',
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
  switch2: {
    type: RfFormBuilderFieldType.SWITCH,
    label: 'Switch 2',
    value: false,
    disabled: true,
  },
  switch3: {
    type: RfFormBuilderFieldType.SWITCH,
    label: 'Switch 3',
    value: false,
    readonly: true,
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
  separator: {
    type: RfFormBuilderFieldType.HTML_INJECTION,
    layout: { class: 'full-width' },
    html: `
      <div style="display: grid; align-items: center; gap: 1rem;">
        <div
          alt="Airplane in flight"
          style="width: 100%;
            height: 200px;
            border: solid 2px #8a8a8a;
            border-radius: 10px;
            background-position: center center;
            background-size: cover;
            background-image: url(https://media.gettyimages.com/id/136899593/es/foto/xl-jet-avi%C3%B3n-despegando-al-atardecer.jpg?s=612x612&w=0&k=20&c=GOFhFIMvUvNLtf7VYp5YgeUAhvLbpT6-LHlWY7wbEKo=);"
        ></div>
        <div>
          <h3 style="margin: 0;">Welcome to SkyWings</h3>
          <p style="margin: 0;">Fly with us and experience a new way of traveling the skies. ✈️</p>
        </div>
      </div>
    `,
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
  phoneNumber: {
    type: RfFormBuilderFieldType.PREFIX_PHONE,
    phoneName: 'phoneNumber',
    autocompletePhone: AutocompleteTypes.PHONE,
    animatedLabelPrefix: 'Prefix',
    animatedLabelPhone: 'Phone Number',
    placeholderPhone: 'Phone number here',
    maxLength: 5,
    options: PREFIX_OPTIONS,
    value: { prefix: '+1', phone: '' },
    validators: {
      prefix: [Validators.required],
      phone: [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(5), Validators.maxLength(5)],
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
  airlines2: {
    type: RfFormBuilderFieldType.LIST,
    options: AA_OPTIONS,
    readonly: true,
    validators: [Validators.required],
    value: 'VY',
  },
  test: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'text',
    animatedLabel: 'Test Custom',
    autocomplete: AutocompleteTypes.ON,
    validators: [Validators.required],
    classes: { input: 'bg-dark text-white fs-2 fw-bold fst-italic' },
    value: '',
  },
  phoneNumber2: {
    type: RfFormBuilderFieldType.PREFIX_PHONE,
    phoneName: 'phoneNumber2',
    autocompletePhone: AutocompleteTypes.PHONE,
    readonly: true,
    appearance: RfAppearanceTypes.INTEGRATED,
    title: 'Phone Number 2',
    animatedLabelPrefix: 'Prefix',
    animatedLabelPhone: 'Phone',
    placeholderPhone: 'Phone number here',
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
    ariaLabelledBy: { prefix: 'info-prefix-1', phone: 'info-phone-1' },
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
  selectDatePicker2: {
    type: RfFormBuilderFieldType.SELECT_DATE_PICKER,
    value: null,
    title: 'Select Datepicker',
    selectsLabels: {
      day: 'Day',
      month: 'Month',
      year: 'Year',
      months: SELECT_DATE_PICKER_MONTHS,
    },
    appearance: RfAppearanceTypes.INTEGRATED,
    validators: {
      day: [Validators.required, DayAgainstMonthAndYearValidator()],
      month: [Validators.required],
      year: [Validators.required],
    },
    errorMessages: ERROR_MESSAGES_SELECT_DATE_PICKER,
    culture: {
      shortDateFormat: 'MM-DD-YYYY',
    },
    ariaLabelledBy: { day: 'day-2', month: 'month-2', year: 'year-2' },
  },
  datepicker: {
    type: RfFormBuilderFieldType.DATEPICKER,
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    classes: {
      calendar: 'fake',
      errorMessages: { message: 'custom-datepicker-message' },
    },
  },
  inputdatepicker: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker',
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    rightIcon: 'calendar',
    hideCaret: true,
  },
  inputdatepickerrange: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker Range',
    value: { startDate: dateHelper.createShortDate(2025, 4, 22), endDate: dateHelper.createShortDate(2025, 4, 25) },
    validators: [Validators.required, RangeRequired()],
    rangeEnabled: true,
    ariaLabelledBy: 'labelled-info',
  },
  datepickerdisabled: {
    type: RfFormBuilderFieldType.DATEPICKER,
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    disabled: true,
  },
  datepickerreadonly: {
    type: RfFormBuilderFieldType.DATEPICKER,
    value: { startDate: dateHelper.createShortDate(2025, 4, 3), endDate: dateHelper.createShortDate(2025, 6, 3) },
    validators: [Validators.required],
    rangeEnabled: true,
    readonly: true,
  },
};

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
    blurInputText: (value: string) => {
      console.log(value);
    },
    pasteInputText: (event: ClipboardEvent) => {
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
    pasteInputText: (event: ClipboardEvent) => {
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
  datepicker: {
    type: RfFormBuilderFieldType.DATEPICKER,
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    classes: {
      calendar: 'custom-calendar-class',
    },
  },
  inputdatepicker: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker',
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    rightIcon: 'calendar',
    hideCaret: true,
  },
  inputdatepickerrange: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker Range',
    value: { startDate: dateHelper.createShortDate(2025, 4, 22), endDate: dateHelper.createShortDate(2025, 4, 25) },
    validators: [Validators.required, RangeRequired()],
    rangeEnabled: true,
    ariaLabelledBy: 'labelled-info',
  },
};

export const FORM_CONFIG_CHECKBOXES1: FormBuilderConfig = {
  checkboxes: {
    type: RfFormBuilderFieldType.CHECKBOX,
    legend: 'Checkboxes',
    checkboxes: CHECKBOX_CONFIG,
    validators: [CheckboxGroupValidator({ max: 2 })],
  },
  radios: {
    type: RfFormBuilderFieldType.RADIO,
    legend: 'Radios',
    radios: RADIOS_CONFIG,
    validators: [Validators.required],
  },
  name: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'name',
    animatedLabel: 'Name',
    autocomplete: AutocompleteTypes.NAME,
    validators: [],
    disabled: true,
    value: 'Rigoberto',
  },
};

export const FORM_CONFIG_CHECKBOXES2: FormBuilderConfig = {
  checkboxes: {
    type: RfFormBuilderFieldType.CHECKBOX,
    legend: 'Checkboxes',
    checkboxes: CHECKBOX_CONFIG,
    validators: [CheckboxGroupValidator({ max: 2 })],
  },
  radios: {
    type: RfFormBuilderFieldType.RADIO,
    legend: 'Radios',
    radios: RADIOS_CONFIG,
    validators: [Validators.required],
  },
  name: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'name',
    animatedLabel: 'Name',
    autocomplete: AutocompleteTypes.NAME,
    validators: [],
    disabled: true,
    value: 'Rigoberto',
  },
};

export const GRID_BUILDER_FAKE_CONFIG: FormBuilderConfig = {
  gender: {
    type: RfFormBuilderFieldType.SELECT,
    animatedLabel: 'Gender',
    options: [
      { value: 'Female', content: 'Female' },
      { value: 'Male', content: 'Male' },
      { value: 'Other', content: 'Other' },
    ],
    validators: [],
    value: '',
  },
  name: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'firstName',
    animatedLabel: 'First Name',
    autocomplete: AutocompleteTypes.ON,
    validators: [],
    disabled: false,
    value: 'Rigoberto',
  },
  surname: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'surname',
    animatedLabel: 'Surname',
    autocomplete: AutocompleteTypes.LAST_NAME,
    readonly: false,
    rightIcon: 'user',
    validators: [],
    value: 'Elaberto',
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
  },
  phoneNumber: {
    type: RfFormBuilderFieldType.PREFIX_PHONE,
    phoneName: 'phoneNumber',
    autocompletePhone: AutocompleteTypes.PHONE,
    appearance: RfAppearanceTypes.INTEGRATED,
    title: 'Phone Number',
    animatedLabelPrefix: 'Prefix',
    animatedLabelPhone: 'Phone',
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
    ariaLabelledBy: { prefix: 'info-prefix-1', phone: 'info-phone-1' },
  },
  inputdatepicker: {
    type: RfFormBuilderFieldType.INPUT_DATEPICKER,
    animatedLabel: 'Input Datepicker',
    value: dateHelper.todayAsShortDate(),
    validators: [Validators.required],
    rightIcon: 'calendar',
    hideCaret: true,
  },
  selectDatePicker: {
    type: RfFormBuilderFieldType.SELECT_DATE_PICKER,
    value: dayjs().utc(),
    title: 'Input Datepicker',
    appearance: RfAppearanceTypes.INTEGRATED,
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
};

export const GRID_BUILDER_LOGIN_FAKE_CONFIG: FormBuilderConfig = {
  name: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'firstName',
    animatedLabel: 'First Name',
    autocomplete: AutocompleteTypes.ON,
    validators: [],
    disabled: false,
    value: 'Rigoberto',
  },
  surname: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'surname',
    animatedLabel: 'Surname',
    autocomplete: AutocompleteTypes.LAST_NAME,
    readonly: false,
    rightIcon: 'user',
    validators: [],
    value: 'Elaberto',
  },
  email: {
    type: RfFormBuilderFieldType.INPUT,
    name: 'email',
    animatedLabel: 'Email',
    placeholder: 'Enter your email',
    autocomplete: AutocompleteTypes.EMAIL,
    validators: [Validators.required, Validators.email],
    errorMessages: { required: 'Email is requiered' },
  },
};
