import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import type { RfListOption } from '../../../../../lib/components/rf-list/models/rf-list-option.model';
import type { RfSelectClasses } from '../../../../../lib/components/rf-select/models/rf-select-classes.model';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RfSelectComponent } from '../../../../../lib/components/rf-select/rf-select.component';
import { RfFilterType } from '../../../../../lib/services/filter/filter.enum';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';
import { AA_OPTIONS, FLIGHT_CLASS_OPTIONS, PAYMENT_OPTIONS, PREFIX_OPTIONS } from '../list-story/list.config';

import { ROUTE_OPTIONS, SELECT_CUSTOM_CLASSES, SELECT_ERROR_MESSAGES } from './select.config';

@Component({
  selector: 'select-story',
  imports: [
    ReactiveFormsModule,
    RfSelectComponent,
    FormValidationFeaturesComponent,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
  templateUrl: './select-story.component.html',
  styleUrls: ['./select-story.component.scss'],
})
export class SelectStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public SELECT_ERROR_MESSAGES = SELECT_ERROR_MESSAGES;
  public myForm = new RfFormGroup(
    'MyForm',
    {
      formControlDays: new RfFormControl(''),
      flightClass: new RfFormControl('', [Validators.required]),
      payMethods: new RfFormControl('', [Validators.required]),
      payMethods2: new RfFormControl('', [Validators.required]),
      airlines: new RfFormControl('', [Validators.required]),
      prefix: new RfFormControl('', [Validators.required]),
      readonly: new RfFormControl({ value: 'business', disabled: false }),
      disabled: new RfFormControl({ value: 'economy', disabled: true }),
      routes: new RfFormControl('', [Validators.required]),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );

  protected listNumber: RfListOption[] = Array.from({ length: 100 }, (_, i) => ({
    value: (i + 1).toString(),
    content: (i + 1).toString(),
  }));
  protected flightClassOptions: RfListOption[] = FLIGHT_CLASS_OPTIONS;
  protected paymentMethodsOptions: RfListOption[] = PAYMENT_OPTIONS;
  protected airlineOptions: RfListOption[] = AA_OPTIONS;
  protected routeOptions: RfListOption[] = ROUTE_OPTIONS;
  protected prefixOptions: RfListOption[] = PREFIX_OPTIONS;
  protected customClasses: RfSelectClasses = SELECT_CUSTOM_CLASSES;
  protected fiterType = RfFilterType;
  protected prefixMask = (data: SafeHtml): SafeHtml => {
    if (!data) return '';
    const match: RegExpMatchArray | null = String(data).match(/\+(\d+)/);
    return match?.[1] ?? '';
  };
}
