import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { AA_OPTIONS, FLIGHT_CLASS_OPTIONS, PAYMENT_OPTIONS, PREFIX_OPTIONS } from './list.config';

@Component({
  selector: 'list-story',
  imports: [
    ReactiveFormsModule,
    RfReactiveFormsModule,
    FormValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
  templateUrl: './list-story.component.html',
  styleUrl: './list-story.component.scss',
  standalone: true,
})
export class ListStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public myForm = new RfFormGroup(
    'MyForm',
    {
      flightClassList: new RfFormControl('business'),
      listRequired: new RfFormControl('', [Validators.required]),
      customClasses: new RfFormControl('+33'),
      readOnlyList: new RfFormControl({ value: 'LH', disabled: false }),
      disabledList: new RfFormControl({ value: 'economy', disabled: true }),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public flightClassOptions = FLIGHT_CLASS_OPTIONS;
  public paymentMethodsOptions = PAYMENT_OPTIONS;
  public prefixOptions = PREFIX_OPTIONS;
  public airlinesOptions = AA_OPTIONS;
}
