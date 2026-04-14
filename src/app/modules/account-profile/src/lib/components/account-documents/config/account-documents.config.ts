import { Validators } from '@angular/forms';
import { RfSelectDatePickerFieldFactoryService } from '@dcx/ui/business-common';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import {
  AutocompleteTypes,
  DayAgainstMonthAndYearValidator,
  FormBuilderConfig,
  FutureDateValidator,
  RfFormBuilderFieldType,
  RfListOption,
} from 'reactive-forms';

import { TranslationKeys } from '../../../core/enum/translation-keys.enum';

export function getConfig(
  documentOptions: RfListOption[],
  countryOptions: RfListOption[],
  selectDatePickerFieldFactory: RfSelectDatePickerFieldFactoryService,
  translateService: TranslateService
): FormBuilderConfig {
  const config: FormBuilderConfig = {
    documentType: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_DocumentType_Label),
      options: documentOptions,
      validators: [Validators.required],
      value: '',
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentType_Required_Message
        ),
      },
    },
    documentNumber: {
      type: RfFormBuilderFieldType.INPUT,
      name: 'documentNumber',
      autocomplete: AutocompleteTypes.ON,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_DocumentNumber_Label),
      validators: [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+$/),
        Validators.minLength(5),
        Validators.maxLength(50),
      ],
      value: '',
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentNumber_Required_Message
        ),
        pattern: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentNumber_Pattern_Message
        ),
        minlength: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentNumber_Min_Message
        ),
        maxlength: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentNumber_Max_Message
        ),
      },
    },
    documentNationality: {
      type: RfFormBuilderFieldType.SELECT,
      animatedLabel: translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_DocumentNationality_Label),
      options: countryOptions,
      validators: [Validators.required],
      errorMessages: {
        required: translateService.instant(
          TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_DocumentNationality_Required_Message
        ),
      },
    },
    documentExpirationDate: selectDatePickerFieldFactory.create({
      title: translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_DocumentExpirationDate_Title),
      yearRange: { startYear: dayjs().year(), endYear: dayjs().year() + 10 },
      validators: {
        day: [Validators.required, DayAgainstMonthAndYearValidator(), FutureDateValidator()],
        month: [Validators.required],
        year: [Validators.required],
      },
      errorMessages: {
        day: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_Day_Required_Message
          ),
          invalidDay: translateService.instant(
            TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_Day_InvalidDay_Message
          ),
          invalidFutureDate: translateService.instant(
            TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_Day_InvalidFutureDate_Message
          ),
        },
        month: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_Month_Required_Message
          ),
        },
        year: {
          required: translateService.instant(
            TranslationKeys.AccountProfile_DocumentsForm_ErrorMessage_Year_Required_Message
          ),
        },
      },
    }),
  };
  return config;
}
