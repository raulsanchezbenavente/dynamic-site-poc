import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../lib/standalone-imports';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { FORM_CONFIG_AFTER } from '../configs/form-builder.config';

@Component({
  selector: 'form-builder-story',
  templateUrl: './form-builder-story.component.html',
  styleUrl: './form-builder-story.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS, RfFormBuilderComponent, FormValidationFeaturesComponent],
})
export class FormBuilderStoryComponent {
  public formConfig = {};
  public FORM_CONFIG_AFTER = FORM_CONFIG_AFTER;
  public inputTypes = RfInputTypes;
  public displayErrorsMode = RfErrorDisplayModes;
  public currentDisplayErrorMode: RfErrorDisplayModes = RfErrorDisplayModes.TOUCHED;
}
