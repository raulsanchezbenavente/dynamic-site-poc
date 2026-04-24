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
import { prefixPhoneRegex } from '../../../core/regex/prefix-phone.regex';
import { accountContactRegex } from '../regex/account-contact.regex';
export function getConfig(prefixOptions: RfListOption[], translateService: TranslateService): FormBuilderConfig {
  const config: FormBuilderConfig = {
    phoneNumber: {
      type: RfFormBuilderFieldType.PREFIX_PHONE,
      phoneName: 'phoneNumber',
      autocompletePhone: AutocompleteTypes.PHONE,
      animatedLabelPrefix: translateService.instant(TranslationKeys.AccountProfile_ContactForm_Prefix_Label),
      animatedLabelPhone: translateService.instant(TranslationKeys.AccountProfile_ContactForm_PhoneNumber_Label),
      title: translateService.instant(TranslationKeys.AccountProfile_ContactForm_Phone_Label),
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
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Phone_Required_Message
          ),
          minlength: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Phone_Minlength_Message
          ),
          maxlength: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Phone_Maxlength_Message
          ),
          pattern: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Phone_InvalidPattern_Message
          ),
        },
        prefix: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Prefix_Required_Message
          ),
          minlength: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Prefix_Minlength_Message
          ),
          maxlength: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Prefix_Maxlength_Message
          ),
          pattern: translateService.instant(
            TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Prefix_InvalidPattern_Message
          ),
        },
      },
    } as RfPrefixPhoneField,
    email: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'Email',
      autocomplete: AutocompleteTypes.NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_ContactForm_Email_Label),
      validators: [Validators.required, Validators.pattern(accountContactRegex.email.validationPattern)],
      value: '',
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Email_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_ContactForm_ErrorMessage_Email_InvalidPattern_Message
        ),
      },
      disabled: false,
    } as RfInputField,
  };
  return config;
}
