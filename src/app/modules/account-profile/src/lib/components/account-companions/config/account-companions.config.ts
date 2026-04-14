import { Validators } from '@angular/forms';
import { RfSelectDatePickerFieldFactoryService } from '@dcx/ui/business-common';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteTypes, FormBuilderConfig, RfFormBuilderFieldType, RfListOption } from 'reactive-forms';

import { TranslationKeys } from '../../../core/enum/translation-keys.enum';
import { accountCompanionRegex } from '../../../core/regex/account-companion.regex';

export function getConfig(
  genderOptions: RfListOption[],
  countryOptions: RfListOption[],
  translateService: TranslateService,
  selectDatePickerFieldFactory: RfSelectDatePickerFieldFactoryService
): FormBuilderConfig {
  const config: FormBuilderConfig = {
    gender: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_Gender_Label),
      options: genderOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Gender_Required_Message
        ),
      },
    },
    name: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'name',
      autocomplete: AutocompleteTypes.NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_Name_Label),
      validators: [Validators.required, Validators.pattern(accountCompanionRegex.name.validationPattern)],
      inputPattern: accountCompanionRegex.name.inputPattern,
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Name_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Name_InvalidPattern_Message
        ),
      },
    },
    lastName: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'lastName',
      autocomplete: AutocompleteTypes.LAST_NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_LastName_Label),
      validators: [Validators.required, Validators.pattern(accountCompanionRegex.lastName.validationPattern)],
      inputPattern: accountCompanionRegex.lastName.inputPattern,
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_LastName_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_LastName_InvalidPattern_Message
        ),
      },
    },
    birthday: selectDatePickerFieldFactory.create({
      title: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_Birthday_Label),
      errorMessages: {
        day: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Day_Required_Message
          ),
        },
        month: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Month_Required_Message
          ),
        },
        year: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Year_Required_Message
          ),
        },
      },
    }),
    country: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_Country_Label),
      options: countryOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_CompanionsForm_ErrorMessage_Country_Required_Message
        ),
      },
    },
    lifemilesNumber: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'lifemilesNumber',
      autocomplete: AutocompleteTypes.ON,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_Lifemiles_Label),
    },
  };
  return config;
}
