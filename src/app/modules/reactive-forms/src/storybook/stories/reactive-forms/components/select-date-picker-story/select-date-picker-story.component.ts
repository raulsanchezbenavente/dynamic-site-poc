import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import type { SafeHtml } from '@angular/platform-browser';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import { CultureHelperService, CultureService, type UserCulture } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import type { MonthAbbreviationConfig } from '../../../../../lib';
import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfAppearanceTypes } from '../../../../../lib/abstract/enums/rf-base-reactive-appearance.enum';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import type { RfSelectDatePickerClases } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-classes.model';
import type { RfSelectDatePickerErrorMessages } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-error-messages.model';
import type { RfSelectDatePickerHintMessages } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-hint-messages.model';
import type { RfSelectDatePickerOptionsData } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-months.model';
import type { RfSelectDatePickerValidators } from '../../../../../lib/components/rf-select-date-picker/models/rf-select-date-picker-validators.model';
import { DayAgainstMonthAndYearValidator } from '../../../../../lib/components/rf-select-date-picker/validators/rf-select-date-picker-incorrect-day.validator';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { DateHelper } from '../../../../../lib/helpers/date.helper';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import {
  CUSTOM_SELECT_LABEL_VALUES,
  DATE_PICKER_CUSTOM_CLASSES,
  ERROR_MESSAGES_SELECT_DATE_PICKER,
  HINT_MESSAGES_GENERAL_SELECT_DATE_PICKER,
  HINT_MESSAGES_SPECIFIC_SELECT_DATE_PICKER,
  SELECT_LABEL_VALUES,
  UNIFIED_ERROR_MESSAGES_SELECT_DATE_PICKER,
} from './select-date-picker.config';

@Component({
  selector: 'select-date-picker-story',
  templateUrl: './select-date-picker-story.component.html',
  styleUrls: ['./select-date-picker-story.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormValidationFeaturesComponent,
    HoverOpacityDirective,
    ReactiveFormsModule,
    RfReactiveFormsModule,
    StandaloneValidationFeaturesComponent,
    TabPresentationComponent,
    TranslateModule,
  ],
})
export class SelectDatePickerStoryComponent implements OnInit {
  private readonly dateHelper = inject(DateHelper);
  private readonly cultureHelper = inject(CultureHelperService);
  private readonly cultureService = inject(CultureService);
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public RfAppearanceTypes = RfAppearanceTypes;
  public NewDate: Dayjs = dayjs().utc();
  public DateCustomUTC: Dayjs = this.dateHelper.parseNaiveUtc('Tue Jan 30 1990 01:00:00 GMT+0800');
  public DateCustom1: Dayjs = this.dateHelper.utcDayJs(2012, 12, 31);
  public DateCustom2: Dayjs = this.dateHelper.utcDayJs(2020, 3, 15);
  public Validators = Validators;
  public DayAgainstMonthAndYearValidator = DayAgainstMonthAndYearValidator;
  public CommonValidator: RfSelectDatePickerValidators = {
    day: [Validators.required, DayAgainstMonthAndYearValidator()],
    month: [Validators.required],
    year: [Validators.required],
  };
  public get primaryCulture(): UserCulture {
    return this.cultureService.culture();
  }
  public get secondaryCulture(): UserCulture {
    return this.cultureService.culture('SECONDARY_CULTURE');
  }
  public myForm = new RfFormGroup(
    'MyForm',
    {
      selectDatePicker1: new RfFormControl(this.DateCustomUTC),
      selectDatePicker2: new RfFormControl(null, this.CommonValidator),
      selectDatePicker3: new RfFormControl({ value: '', disabled: false }, this.CommonValidator),
      selectDatePicker4: new RfFormControl({ value: this.DateCustom1, disabled: false }, this.CommonValidator),
      selectDatePicker5: new RfFormControl({ value: this.DateCustom2, disabled: false }, this.CommonValidator),
      selectDatePicker6: new RfFormControl({ value: this.NewDate, disabled: true }, this.CommonValidator),
      selectDatePicker7: new RfFormControl({ value: null }, this.CommonValidator),
      selectDatePicker8: new RfFormControl({ value: '' }, this.CommonValidator),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public errorMessagesSelectDatePicker: RfSelectDatePickerErrorMessages = ERROR_MESSAGES_SELECT_DATE_PICKER;
  public unifiedErrorMessagesSelectDatePicker: RfSelectDatePickerErrorMessages =
    UNIFIED_ERROR_MESSAGES_SELECT_DATE_PICKER;
  public hintMessagesGeneralSelectDatePicker: RfSelectDatePickerHintMessages = HINT_MESSAGES_GENERAL_SELECT_DATE_PICKER;
  public hintMessagesSpecificSelectDatePicker: RfSelectDatePickerHintMessages =
    HINT_MESSAGES_SPECIFIC_SELECT_DATE_PICKER;
  public datePickerCustomClasses: RfSelectDatePickerClases = DATE_PICKER_CUSTOM_CLASSES;
  public selectsLabelValues: RfSelectDatePickerOptionsData = SELECT_LABEL_VALUES;
  public customSelectsLabelValues: RfSelectDatePickerOptionsData = CUSTOM_SELECT_LABEL_VALUES;
  public selectedCultureIds = {
    primary: 'es-ES',
    secondary: 'en-US',
  };
  private readonly cultureLocales: Array<{ id: string; label: string; locale: string }> = [
    { id: 'en-US', label: 'en-US (US)', locale: 'en-US' },
    { id: 'es-ES', label: 'es-ES (Spain)', locale: 'es-ES' },
    { id: 'es-CO', label: 'es-CO (Colombia)', locale: 'es-CO' },
    { id: 'pt-BR', label: 'pt-BR (Brazil)', locale: 'pt-BR' },
    { id: 'fr-FR', label: 'fr-FR (France)', locale: 'fr-FR' },
    { id: 'fr-CA', label: 'fr-CA (Canada)', locale: 'fr-CA' },
    { id: 'en-GB', label: 'en-GB (UK)', locale: 'en-GB' },
    { id: 'de-DE', label: 'de-DE (Germany)', locale: 'de-DE' },
    { id: 'zh-CN', label: 'zh-CN (China)', locale: 'zh-CN' },
    { id: 'ja-JP', label: 'ja-JP (Japan)', locale: 'ja-JP' },
    { id: 'ko-KR', label: 'ko-KR (Korea)', locale: 'ko-KR' },
    { id: 'iso', label: 'ISO (Neutral)', locale: 'iso' },
  ];
  public cultureOptions: Array<{ id: string; label: string; value: UserCulture }> = this.buildCultureOptions();
  protected abbreviationBehaviour: MonthAbbreviationConfig = {
    threshold: 380,
    mask: (data: SafeHtml): SafeHtml => {
      const monthLabel = this.normalizeMonthLabel(data);
      if (!monthLabel) {
        return data;
      }

      const locales = ['en', 'es', 'fr', 'pt'];
      for (const locale of locales) {
        const months = Array.from({ length: 12 }, (_value, index) =>
          dayjs().locale(locale).month(index).format('MMMM').toLowerCase()
        );
        const monthIndex = months.findIndex((month) => month === monthLabel);
        if (monthIndex !== -1) {
          return dayjs().locale(locale).month(monthIndex).format('MMM');
        }
      }

      return data;
    },
  };

  public ngOnInit(): void {
    this.onCultureChange('en-US');
    this.onCultureChange('en-US', 'secondary');
  }

  private normalizeMonthLabel(data: SafeHtml): string | null {
    if (typeof data === 'string') {
      return data.trim().toLowerCase();
    }

    if (data && typeof data === 'object' && 'changingThisBreaksApplicationSecurity' in data) {
      const raw = (data as { changingThisBreaksApplicationSecurity?: string }).changingThisBreaksApplicationSecurity;
      return raw ? raw.trim().toLowerCase() : null;
    }

    const fallback = String(data).trim();
    return fallback ? fallback.toLowerCase() : null;
  }
  private buildCultureOptions(): Array<{ id: string; label: string; value: UserCulture }> {
    return this.cultureLocales.map((option) => ({
      id: option.id,
      label: option.label,
      value: this.createCultureFromLocale(option.locale),
    }));
  }

  private createCultureFromLocale(locale: string): UserCulture {
    if (locale === 'iso') {
      return { shortDateFormat: 'YYYY-MM-DD' };
    }

    return {
      shortDateFormat: this.cultureHelper.getShortDateFormat(locale),
    };
  }

  public onCultureChange(id: string, target: 'primary' | 'secondary' = 'primary'): void {
    const selected = this.cultureOptions.find((option) => option.id === id);
    if (!selected) {
      return;
    }

    if (target === 'secondary') {
      this.cultureService.setCulture(selected.value, 'SECONDARY_CULTURE');
      this.selectedCultureIds.secondary = id;
      return;
    }

    this.cultureService.setCulture(selected.value);
    this.selectedCultureIds.primary = id;
  }

  public trackByCultureId(_index: number, option: { id: string }): string {
    return option.id;
  }
}
