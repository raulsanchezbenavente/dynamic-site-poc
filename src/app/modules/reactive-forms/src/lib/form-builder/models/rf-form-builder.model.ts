import { ValidatorFn } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { UserCulture } from '@dcx/ui/libs';
import { Dayjs } from 'dayjs';

import { RfAppearanceTypes } from '../../abstract/enums/rf-base-reactive-appearance.enum';
import { RfErrorMessageSingleComponent } from '../../components/common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessages } from '../../components/common/rf-error-messages/types/rf-error-messages.types';
import { RfHintMessages } from '../../components/common/rf-hint-messages/types/rf-hint-messages.types';
import { RfDatepickerClasses } from '../../components/rf-datepicker/models/rf-datepicker-classes.model';
import { RfDatepickerValue } from '../../components/rf-datepicker/models/rf-datepicker-value.model';
import { RfInputDatepickerClasses } from '../../components/rf-input-datepicker/models/rf-input-datepciker-classes.model';
import { AutocompleteTypes } from '../../components/rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputClasses } from '../../components/rf-input-text/models/rf-input-classes.model';
import { RfInputTextMessages } from '../../components/rf-input-text/models/rf-input-text-messages.model';
import { RfInputTypes } from '../../components/rf-input-text/models/rf-input-types.model';
import { RfIpAria } from '../../components/rf-ip-input/models/rf-ip-input-aria.model';
import { RfIpInputClasses } from '../../components/rf-ip-input/models/rf-ip-input-classes.model';
import { RfIpErrorMessages } from '../../components/rf-ip-input/models/rf-ip-input-error-messages.model';
import { RfIpinputValidators } from '../../components/rf-ip-input/models/rf-ip-input-validators.model';
import { RfIpInputValue } from '../../components/rf-ip-input/models/rf-ip-input-value.model';
import { RfListOption } from '../../components/rf-list/models/rf-list-option.model';
import { RfPrefixPhoneAria } from '../../components/rf-prefix-phone/models/rf-prefix-phone-aria.model';
import { RfPrefixPhoneClases } from '../../components/rf-prefix-phone/models/rf-prefix-phone-classes.model';
import { RfPrefixPhoneErrorMessages } from '../../components/rf-prefix-phone/models/rf-prefix-phone-error-messages.model';
import { RfPrefixPhoneValidators } from '../../components/rf-prefix-phone/models/rf-prefix-phone-validators.model';
import { RfPrefixPhoneValue } from '../../components/rf-prefix-phone/models/rf-prefix-phone-value.model';
import { RfSelectDatePickerAria } from '../../components/rf-select-date-picker/models/rf-select-date-picker-aria.model';
import { RfSelectDatePickerClases } from '../../components/rf-select-date-picker/models/rf-select-date-picker-classes.model';
import { RfSelectDatePickerErrorMessages } from '../../components/rf-select-date-picker/models/rf-select-date-picker-error-messages.model';
import { RfSelectDatePickerOptionsData } from '../../components/rf-select-date-picker/models/rf-select-date-picker-months.model';
import { MonthAbbreviationConfig } from '../../components/rf-select-date-picker/types/rf-select-date-picker-abbreviation.type';
import { RfOptionsFilter } from '../../services/filter/filter.model';
import { RfFormBuilderFieldType } from '../enums/rf-form-builder.types.enum';
import { RfAria } from '../types/rf-form-builder-aria.type';
import { RfClasses } from '../types/rf-form-builder-classes.type';
import { RfValidator } from '../types/rf-form-builder-validator.type';

export interface RfLayout {
  class?: string;
}

export interface RfHTMLInjection {
  type: RfFormBuilderFieldType.HTML_INJECTION;
  layout?: RfLayout;
  html?: string;
}

export interface RfBaseFormField<VALUE> {
  type: RfFormBuilderFieldType;
  placeholder?: string;
  readonly?: boolean;
  value?: VALUE;
  disabled?: boolean;
  validators?: RfValidator;
  errorMessages?: RfErrorMessages;
  hintMessages?: RfHintMessages;
  classes?: RfClasses;
  ariaLabelledBy?: RfAria;
  layout?: RfLayout;
}

export interface RfRadioOptionFormBuilder {
  label: string;
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  readonly?: boolean;
}

export interface RfCheckboxOptionFormBuilder {
  label?: string;
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  readonly?: boolean;
}

export interface RfInputField extends RfBaseFormField<string> {
  type: RfFormBuilderFieldType.INPUT;
  inputType?: RfInputTypes;
  name: string;
  maxLength?: number;
  autocomplete: AutocompleteTypes;
  rightIcon?: string;
  leftIcon?: string;
  appearance?: RfAppearanceTypes;
  inputPattern?: RegExp;
  animatedLabel?: string;
  errorMessages?: RfErrorMessageSingleComponent;
  messages?: RfInputTextMessages;
  classes?: RfInputClasses;
  blurInputText?: (value: string) => void;
  pasteInputText?: (event: ClipboardEvent) => void;
  dragleaveInputText?: (event: DragEvent) => void;
}

export interface RfRadioField {
  type: RfFormBuilderFieldType.RADIO;
  legend?: string;
  radios: RfRadioOptionFormBuilder[];
  validators?: ValidatorFn[];
}

export interface RfCheckboxField {
  type: RfFormBuilderFieldType.CHECKBOX;
  legend?: string;
  checkboxes: RfCheckboxOptionFormBuilder[];
  validators?: ValidatorFn[];
}

export interface RfSwitchField extends RfBaseFormField<boolean> {
  type: RfFormBuilderFieldType.SWITCH;
  label?: string;
  value?: boolean;
  disabled?: boolean;
}

export interface RfListField extends RfBaseFormField<string> {
  type: RfFormBuilderFieldType.LIST;
  filter?: RfOptionsFilter;
  options: RfListOption[];
  typeaheadIncludes?: boolean;
  errorMessages?: RfErrorMessageSingleComponent;
}

export interface RfSelectField extends RfBaseFormField<string> {
  type: RfFormBuilderFieldType.SELECT;
  animatedLabel?: string;
  filter?: RfOptionsFilter;
  appearance?: RfAppearanceTypes;
  rightIcon?: string;
  leftIcon?: string;
  hideCaret?: boolean;
  options: RfListOption[];
  typeaheadIncludes?: boolean;
  mask?: (data: SafeHtml) => SafeHtml;
  errorMessages?: RfErrorMessageSingleComponent;
}

export interface RfSelectDatePickerField extends RfBaseFormField<Dayjs | null> {
  type: RfFormBuilderFieldType.SELECT_DATE_PICKER;
  title?: string;
  appearance?: RfAppearanceTypes;
  yearRange?: { startYear: number; endYear: number };
  selectsLabels?: RfSelectDatePickerOptionsData;
  errorMessages?: RfSelectDatePickerErrorMessages;
  classes?: RfSelectDatePickerClases;
  separatedErrors?: boolean;
  abbreviationMonth?: MonthAbbreviationConfig;
  ariaLabelledBy?: RfSelectDatePickerAria;
  typeaheadIncludes?: boolean;
  culture?: UserCulture;
}

export interface RfIpInputField extends RfBaseFormField<RfIpInputValue> {
  type: RfFormBuilderFieldType.IP;
  title?: string;
  animatedLabel?: string;
  validators?: RfIpinputValidators;
  errorMessages?: RfIpErrorMessages;
  classes?: RfIpInputClasses;
  ariaLabelledBy?: RfIpAria;
}

export interface RfPrefixPhoneField extends RfBaseFormField<RfPrefixPhoneValue> {
  type: RfFormBuilderFieldType.PREFIX_PHONE;
  title?: string;
  phoneName: string;
  autocompletePhone: AutocompleteTypes;
  placeholderPrefix?: string;
  placeholderPhone?: string;
  animatedLabelPrefix?: string;
  animatedLabelPhone?: string;
  maxLength?: number;
  appearance?: RfAppearanceTypes;
  options: RfListOption[];
  inputPatternPhone?: RegExp;
  mask?: (data: SafeHtml) => SafeHtml;
  validators?: RfPrefixPhoneValidators;
  errorMessages?: RfPrefixPhoneErrorMessages;
  classes?: RfPrefixPhoneClases;
  separatedErrors?: boolean;
  ariaLabelledBy?: RfPrefixPhoneAria;
  pasteInputText?: (event: ClipboardEvent) => void;
  dragleaveInputText?: (event: DragEvent) => void;
}

export interface RfDatePickerField extends RfBaseFormField<RfDatepickerValue> {
  type: RfFormBuilderFieldType.DATEPICKER;
  value?: RfDatepickerValue;
  disabled?: boolean;
  errorMessages?: RfErrorMessageSingleComponent;
  validators?: RfValidator;
  displayMonths?: number;
  showWeekNumbers?: boolean;
  outsideDays?: string;
  readonly?: boolean;
  rangeEnabled?: boolean;
  rangeStartDate?: Date;
  rangeEndDate?: Date;
  specificStartDateRange?: Date;
  specificEndDaterange?: Date;
  classes?: RfDatepickerClasses;
  specificDate?: Date;
  culture?: UserCulture;
  minDate?: Date;
  maxDate?: Date;
}

export interface RfInputDatePickerField extends RfBaseFormField<RfDatepickerValue> {
  type: RfFormBuilderFieldType.INPUT_DATEPICKER;
  value?: RfDatepickerValue;
  disabled?: boolean;
  errorMessages?: RfErrorMessageSingleComponent;
  animatedLabel?: string;
  readonly?: boolean;
  classes?: RfInputDatepickerClasses;
  placeholder?: string;
  appearance?: RfAppearanceTypes;
  rightIcon?: string;
  leftIcon?: string;
  hideCaret?: boolean;
  specificDate?: Date;
  culture?: UserCulture;
  minDate?: Date;
  maxDate?: Date;
  displayMonths?: number;
  showWeekNumbers?: boolean;
  outsideDays?: string;
  rangeEnabled?: boolean;
  rangeStartDate?: Date;
  rangeEndDate?: Date;
  specificStartDateRange?: Date;
  specificEndDaterange?: Date;
  validators?: RfValidator;
}
