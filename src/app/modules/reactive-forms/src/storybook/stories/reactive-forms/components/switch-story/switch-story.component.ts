import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import type { RfSwitchClasses } from '../../../../../lib/components/rf-switch/models/rf-switch-classes.model';
import { switchRequired } from '../../../../../lib/components/rf-switch/validators/rf-switch-validators';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../lib/standalone-imports';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { ERROR_SWITCH_FALSE, ERROR_SWITCH_TRUE, SWITCH_CUSTOM_CLASSES } from './switch.config';

@Component({
  selector: 'switch-story',
  templateUrl: './switch-story.component.html',
  styleUrl: './switch-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS,
    FormValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
})
export class SwitchStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public switchRequired = switchRequired;
  public myForm = new RfFormGroup(
    'MyForm',
    {
      switch1: new RfFormControl(true),
      switch2: new RfFormControl({ value: false, disabled: false }, [switchRequired({ requiredValue: true })]),
      switch3: new RfFormControl({ value: true, disabled: false }, [switchRequired({ requiredValue: false })]),
      switch4: new RfFormControl({ value: false }),
      switch5: new RfFormControl({ value: true, disabled: true }),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public swithCustomClasses: RfSwitchClasses = SWITCH_CUSTOM_CLASSES;
  public errorSwitch1: RfErrorMessageSingleComponent = ERROR_SWITCH_TRUE;
  public errorSwitch2: RfErrorMessageSingleComponent = ERROR_SWITCH_FALSE;
}
