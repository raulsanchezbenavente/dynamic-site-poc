import { Validators } from '@angular/forms';
import { RfSelectDatePickerFieldFactoryService } from '@dcx/ui/business-common';
import { EnumSeparators } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteTypes, FormBuilderConfig, RfFormBuilderFieldType, RfListOption } from 'reactive-forms';

import { TranslationKeys } from '../../../enums/translation-keys.enum';
import { accountPersonalRegex } from '../../../core/regex/account-personal.regex';

export function getConfig(
  genderOptions: RfListOption[],
  countryOptions: RfListOption[],
  translateService: TranslateService,
  culture: string,
  selectDatePickerFieldFactory: RfSelectDatePickerFieldFactoryService
): FormBuilderConfig {
  const config: FormBuilderConfig = {
    gender: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Gender_Label),
      options: genderOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Gender_Required_Message
        ),
      },
    },
    name: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'name',
      autocomplete: AutocompleteTypes.NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Name_Label),
      readonly: true,
      placeholder: EnumSeparators.DASH,
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_FirstName_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_FirstName_InvalidPattern_Message
        ),
      },
    },
    lastName: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'lastName',
      autocomplete: AutocompleteTypes.LAST_NAME,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_LastName_Label),
      readonly: true,
      placeholder: EnumSeparators.DASH,
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_LastName_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_LastName_InvalidPattern_Message
        ),
      },
    },
    birthday: selectDatePickerFieldFactory.create({
      title: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Birthday_Label),
      readonly: true,
      placeholder: EnumSeparators.DASH,
      culture: { shortDateFormat: culture === 'en' ? 'MM-DD-YYYY' : 'DD-MM-YYYY' },
      errorMessages: {
        day: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Day_Required_Message
          ),
        },
        month: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Month_Required_Message
          ),
        },
        year: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Year_Required_Message
          ),
        },
      },
    }),
    nationality: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Nationality_Label),
      options: countryOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Nationality_Required_Message
        ),
        invalid: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_InvalidNationality_Message
        ),
      },
    },
    country: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Country_Label),
      options: countryOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Country_Required_Message
        ),
      },
    },
    /*city: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'city',
      autocomplete: AutocompleteTypes.CITY,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_City_Label),
      //validators: [Validators.required, Validators.pattern(accountPersonalRegex.city.validationPattern)],
      validators: [],
      inputPattern: accountPersonalRegex.city.inputPattern,
      maxLength: 100,
      errorMessages: {
        //required: translateService.instant(
        //  TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_City_Required_Message
        //),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_City_InvalidPattern_Message
        ),
      },
    },*/
    address: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'address',
      autocomplete: AutocompleteTypes.ON,
      validators: [
        Validators.required,
        Validators.pattern(accountPersonalRegex.address.validationPattern),
        Validators.maxLength(120),
      ],
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Address_Label),
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Address_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Address_InvalidPattern_Message
        ),
        maxlength: translateService.instant(
          TranslationKeys.AccountProfile_PersonalForm_ErrorMessage_Address_MaxLength_Message,
          { maxLength: 500 }
        ),
      },
    },
  };
  return config;
}
