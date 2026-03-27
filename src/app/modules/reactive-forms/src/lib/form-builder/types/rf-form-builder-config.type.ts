import {
  RfCheckboxField,
  RfDatePickerField,
  RfHTMLInjection,
  RfInputDatePickerField,
  RfInputField,
  RfIpInputField,
  RfListField,
  RfPrefixPhoneField,
  RfRadioField,
  RfSelectDatePickerField,
  RfSelectField,
  RfSwitchField,
} from '../models/rf-form-builder.model';

export type FormBuilderConfig = Record<
  string,
  | RfHTMLInjection
  | RfInputField
  | RfRadioField
  | RfCheckboxField
  | RfSwitchField
  | RfIpInputField
  | RfListField
  | RfSelectField
  | RfPrefixPhoneField
  | RfSelectDatePickerField
  | RfDatePickerField
  | RfInputDatePickerField
>;
