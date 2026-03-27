import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RequiredDate } from '../../../../../lib/components/rf-datepicker/validators/date-required.validator';
import { RfInputDatepickerComponent } from '../../../../../lib/components/rf-input-datepicker/rf-input-datepicker.component';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { DateHelper } from '../../../../../lib/helpers/date.helper';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

@Component({
  selector: 'input-datepicker-story',
  imports: [
    ReactiveFormsModule,
    RfReactiveFormsModule,
    FormValidationFeaturesComponent,
    RfInputDatepickerComponent,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    HoverOpacityDirective,
    TranslateModule,
  ],
  templateUrl: './input-datepicker-story.component.html',
  styleUrl: './input-datepicker-story.component.scss',
})
export class InputDatepickerStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  protected readonly dateHelper = inject(DateHelper);
  protected inputdatepickerValue = this.dateHelper.utcDayJs(2025, 4, 22);
  protected rangeinputdatepickerValue = {
    startDate: this.dateHelper.utcDayJs(2025, 4, 3),
    endDate: this.dateHelper.utcDayJs(2025, 4, 10),
  };
  protected todayValue = dayjs().utc();
  public myForm = new RfFormGroup(
    'MyForm',
    {
      inputdatepicker: new RfFormControl({ value: this.inputdatepickerValue, disabled: false }, [
        Validators.required,
        RequiredDate(),
      ]),
      inputdatepicker2: new RfFormControl({ value: '', disabled: false }, [Validators.required, RequiredDate()]),
      rangeinputdatepicker: new RfFormControl({ value: this.rangeinputdatepickerValue, disabled: false }, [
        Validators.required,
      ]),
      readonlydatepicker: new RfFormControl({ value: this.todayValue, disabled: false }),
      disableddatepicker: new RfFormControl({ value: this.todayValue, disabled: true }),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
}
