import { Component } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs';
import {
  MonthAbbreviationConfig,
  RfAppearanceTypes,
  RfListOption,
  RfSelectComponent,
  RfSelectDatePickerComponent,
  RfSelectDatePickerErrorMessages,
  RfSelectDatePickerOptionsData,
} from 'reactive-forms';

import {
  CUSTOM_SELECT_LABEL_VALUES,
  ERROR_MESSAGES_SELECT_DATE_PICKER,
} from '../../reactive-forms/src/storybook/stories/reactive-forms/components/select-date-picker-story/select-date-picker.config';
import { SELECT_ERROR_MESSAGES } from '../../reactive-forms/src/storybook/stories/reactive-forms/components/select-story/select.config';

@Component({
  selector: 'ads',
  standalone: true,
  imports: [TranslateModule, RfSelectComponent, RfSelectDatePickerComponent],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
})
export class AdsComponent {
  public SELECT_ERROR_MESSAGES = SELECT_ERROR_MESSAGES;
  protected listNumber: RfListOption[] = Array.from({ length: 100 }, (_, i) => ({
    value: (i + 1).toString(),
    content: (i + 1).toString(),
  }));
  public customSelectsLabelValues: RfSelectDatePickerOptionsData = CUSTOM_SELECT_LABEL_VALUES;
  public RfAppearanceTypes = RfAppearanceTypes;
  public errorMessagesSelectDatePicker: RfSelectDatePickerErrorMessages = ERROR_MESSAGES_SELECT_DATE_PICKER;
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
}
