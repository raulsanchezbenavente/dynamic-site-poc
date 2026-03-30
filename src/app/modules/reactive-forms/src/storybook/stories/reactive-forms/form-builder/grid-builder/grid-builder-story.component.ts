import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DsButtonComponent } from '@dcx/storybook/design-system';

import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../lib/standalone-imports';
import { GridBuilderLayout } from '../../../../../lib/tools/grid-builder/enums/grid-builder-layout.enum';
import { GridBuilderComponent } from '../../../../../lib/tools/grid-builder/grid-builder.component';
import type { GridBuilderCustomType } from '../../../../../lib/tools/grid-builder/types/grid-builder.type';
import { FORM_CONFIG_AFTER } from '../configs/form-builder.config';

@Component({
  selector: 'grid-builder-story',
  templateUrl: './grid-builder-story.component.html',
  styleUrl: './grid-builder-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS,
    RfFormBuilderComponent,
    GridBuilderComponent,
    DsButtonComponent,
  ],
})
export class GridBuilderStoryComponent {
  public columns = input<number>(2);
  public config = input<Record<string, any>>({});
  public customFields = input<GridBuilderCustomType>({});
  public appearance = input<GridBuilderLayout>(GridBuilderLayout.DEFAULT);

  public FORM_CONFIG_AFTER = FORM_CONFIG_AFTER;
  public inputTypes = RfInputTypes;
  public displayErrorsMode = RfErrorDisplayModes;
  public currentDisplayErrorMode: RfErrorDisplayModes = RfErrorDisplayModes.TOUCHED;
  public bypassedConfig: Record<string, any> = {};

  public get formConfig(): Record<string, any> {
    return this.config;
  }
}
