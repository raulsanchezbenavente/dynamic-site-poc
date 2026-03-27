import { Component, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DsLayoutSwapperComponent,
  DsSummaryBuilderComponent,
  DsSummaryRendererComponent,
  LayoutSlotDirective,
  type SummaryDataRenderer,
} from '@dcx/ui/design-system';
import { SummaryBuilderService } from 'reactive-forms';
import { GridBuilderComponent } from 'reactive-forms';

import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { FORM_CONFIG_AFTER } from '../configs/form-builder.config';

@Component({
  selector: 'summary-builder-story',
  templateUrl: './summary-builder-story.component.html',
  styleUrl: './summary-builder-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RfFormBuilderComponent,
    DsSummaryRendererComponent,
    DsLayoutSwapperComponent,
    GridBuilderComponent,
    DsSummaryBuilderComponent,
    LayoutSlotDirective,
  ],
})
export class SummaryBuilderStoryComponent {
  public readonly layoutSwapper = viewChild<DsLayoutSwapperComponent>('layoutSwap');
  public readonly formAviation = viewChild<RfFormBuilderComponent>('formAviation');

  public formConfig = FORM_CONFIG_AFTER;
  public inputTypes = RfInputTypes;
  public displayErrorsMode = RfErrorDisplayModes;
  public currentDisplayErrorMode: RfErrorDisplayModes = RfErrorDisplayModes.TOUCHED;
  public configSummary: Record<string, SummaryDataRenderer> = {
    name: { label: 'Name', value: 'Rigoberto' },
    surname: { label: 'Surname', value: 'Elaberto' },
    email: { label: 'Email', value: 'ribogerto.elaberto@flyr.com' },
  };
  public myAdditions = {
    completeName: {
      label: (): string => 'Full Name',
      value: (raw: any): string => raw.name + ' ' + raw.surname,
    },
  };

  public bypassConfigToReplace: Record<string, any> = {};
  public bypassConfigSummaryToCreator: Record<string, SummaryDataRenderer> = {};
  public bypassedConfig: Record<string, any> = {};
  private readonly summaryBuilderService: SummaryBuilderService = inject(SummaryBuilderService);

  constructor() {}

  public parseConfig(): void {
    this.bypassConfigSummaryToCreator = this.summaryBuilderService.calculateConfig(
      this.formAviation()!,
      this.myAdditions,
      ['name', 'surname']
    );
    this.changeLayoutView('SECTION_2');
  }

  public changeLayoutView(view: string): void {
    this.layoutSwapper()?.showProjection(view);
  }
}
