import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  AutocompleteTypes,
  dynamicPhoneLengthValidator,
  FormBuilderConfig,
  PHONE_MASK,
  RfFormBuilderFieldType,
  RfInputField,
  RfListOption,
  RfPrefixPhoneField,
} from 'reactive-forms';

import { TranslationKeys } from '../../../enums/translation-keys.enum';
import { emergencyContactRegex } from '../../../core/regex/emergency-contact.regext';
import { prefixPhoneRegex } from '../../../core/regex/prefix-phone.regex';

export function getEmergencyFormConfig(
  prefixOptions: RfListOption[],
  translateService: TranslateService
): FormBuilderConfig {
  const config: FormBuilderConfig = {
    completeName: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'fullName',
      autocomplete: AutocompleteTypes.NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_EmergencyForm_CompleteName_Label),
      validators: [
        Validators.required,
        Validators.pattern(emergencyContactRegex.fullName.validationPattern),
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
      value: '',
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_CompleteName_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_CompleteName_InvalidPattern_Message
        ),
        minlength: translateService.instant(
          TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_CompleteName_Minlength_Message
        ),
        maxlength: translateService.instant(
          TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_CompleteName_Maxlength_Message
        ),
      },
      disabled: false,
    } as RfInputField,
    phoneNumber: {
      type: RfFormBuilderFieldType.PREFIX_PHONE,
      phoneName: 'phoneNumber',
      autocompletePhone: AutocompleteTypes.PHONE,
      animatedLabelPrefix: translateService.instant(TranslationKeys.AccountProfile_EmergencyForm_Prefix_Label),
      animatedLabelPhone: translateService.instant(TranslationKeys.AccountProfile_EmergencyForm_PhoneNumber_Label),
      title: translateService.instant(TranslationKeys.AccountProfile_EmergencyForm_Phone_Label),
      options: prefixOptions,
      inputPatternPhone: prefixPhoneRegex.phoneNumber.inputPattern,
      value: { prefix: '', phone: '' },
      placeholderPhone: '',
      placeholderPrefix: '',
      mask: PHONE_MASK,
      separatedErrors: true,
      typeaheadIncludes: false,
      maxLength: 15,
      validators: {
        prefix: [Validators.required],
        phone: [Validators.required, dynamicPhoneLengthValidator({ totalMinLength: 7, totalMaxLength: 15 })],
      },
      errorMessages: {
        phone: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Phone_Required_Message
          ),
          minlength: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Phone_Minlength_Message
          ),
          maxlength: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Phone_Maxlength_Message
          ),
          pattern: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Phone_InvalidPattern_Message
          ),
        },
        prefix: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Prefix_Required_Message
          ),
          minlength: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Prefix_Minlength_Message
          ),
          maxlength: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Prefix_Maxlength_Message
          ),
          pattern: translateService.instant(
            TranslationKeys.AccountProfile_EmergencyForm_ErrorMessage_Prefix_InvalidPattern_Message
          ),
        },
      },
    } as RfPrefixPhoneField,
  };
  return config;
}
