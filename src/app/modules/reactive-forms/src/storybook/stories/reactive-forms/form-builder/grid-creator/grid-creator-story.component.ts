import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { GridBuilderComponent } from '../../../../../lib/tools/grid-builder/grid-builder.component';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import {
  FORM_CONFIG,
  FORM_CONFIG_AFTER,
  FORM_CONFIG_CHECKBOXES1,
  FORM_CONFIG_CHECKBOXES2,
} from '../configs/form-builder.config';

@Component({
  selector: 'grid-creator-story',
  templateUrl: './grid-creator-story.component.html',
  styleUrl: './grid-creator-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RfFormBuilderComponent,
    FormValidationFeaturesComponent,
    GridBuilderComponent,
  ],
})
export class GridCreatorStoryComponent {
  public columns = input<number>(2);
  public formConfig = {};
  public FORM_CONFIG_AFTER = FORM_CONFIG_AFTER;
  public inputTypes = RfInputTypes;
  public displayErrorsMode = RfErrorDisplayModes;
  public currentDisplayErrorMode: RfErrorDisplayModes = RfErrorDisplayModes.TOUCHED;
  public bypassedConfig: Record<string, any> = {};

  public removeForm(): void {
    this.formConfig = {};
  }

  public reloadForm1(): void {
    this.formConfig = FORM_CONFIG;
  }

  public reloadForm2(): void {
    this.formConfig = FORM_CONFIG_AFTER;
  }
  public loadCheckboxes1(): void {
    this.formConfig = FORM_CONFIG_CHECKBOXES1;
  }

  public loadCheckboxes2(): void {
    this.formConfig = FORM_CONFIG_CHECKBOXES2;
  }

  public updateChangeValidationMode(errorDisplayMode: RfErrorDisplayModes): void {
    this.currentDisplayErrorMode = errorDisplayMode;
  }
}
