import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfDatepickerComponent } from '../../../../../lib/components/rf-datepicker/rf-datepicker.component';
import { RangeRequired } from '../../../../../lib/components/rf-datepicker/validators/range-required.validator';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { DateHelper } from '../../../../../lib/helpers/date.helper';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { ERROR_MESSAGES_DATEPICKER } from './datepicker.config';
dayjs.extend(utc);

@Component({
  selector: 'datepicker-story',
  imports: [
    ReactiveFormsModule,
    RfDatepickerComponent,
    FormValidationFeaturesComponent,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
  templateUrl: './datepicker-story.component.html',
  styleUrl: './datepicker-story.component.scss',
})
export class DatepickerStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  protected readonly dateHelper = inject(DateHelper);
  protected datepicker1Value = this.dateHelper.utcDayJs(2025, 4, 22);
  protected rangedatepickerValue = {
    startDate: this.dateHelper.utcDayJs(2025, 3, 6),
    endDate: this.dateHelper.utcDayJs(2025, 3, 10),
  };
  protected todayValue = dayjs().utc();

  public myForm = new RfFormGroup(
    'MyForm',
    {
      datepicker1: new RfFormControl({ value: this.datepicker1Value, disabled: false }, [Validators.required]),
      rangedatepicker: new RfFormControl({ value: this.rangedatepickerValue, disabled: false }, [RangeRequired()]),
      multiplemonthsdatepicker: new RfFormControl({ value: '', disabled: false }, [Validators.required]),
      disabledaysdatepicker: new RfFormControl({ value: '', disabled: false }, [Validators.required]),
      readonlydatepicker: new RfFormControl({ value: this.todayValue, disabled: false }, [Validators.required]),
      disableddatepicker: new RfFormControl({ value: '', disabled: true }, [Validators.required]),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  protected errorMessagesDatePicker = ERROR_MESSAGES_DATEPICKER;
}
