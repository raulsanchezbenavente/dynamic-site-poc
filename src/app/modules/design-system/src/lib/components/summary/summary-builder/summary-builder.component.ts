import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, computed, effect, EventEmitter, input, model, Output } from '@angular/core';
import { DictionaryType } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { SummaryDataRenderer } from '../summary-renderer/models/summary-data-renderer.model';

import { SummaryBuilderGridConfig } from './models/summary-builder-grid-config.model';

@Component({
  selector: 'ds-summary-builder',
  templateUrl: './summary-builder.component.html',
  styleUrl: './styles/summary-builder.styles.scss',
  imports: [TranslateModule, NgClass, KeyValuePipe],
  standalone: true,
})
export class DsSummaryBuilderComponent {
  @Output() public configChange = new EventEmitter<any>();
  public formName = input<string>('');

  public translations = input<DictionaryType>({});
  public config = input<Record<string, SummaryDataRenderer>>({});
  public gridConfig = model<SummaryBuilderGridConfig>();
  public emptyMask = input<string>('-');

  public originalOrder = (): number => 0;

  public gridClasses = computed((): string => {
    const config = this.gridConfig();
    if (config === undefined) {
      return '';
    }
    let gridClasses = '';
    if (config.columns !== undefined || config.twoColumnsOnMobile !== undefined) {
      gridClasses += 'summary-builder--grid ';
    }
    if (config.columns !== undefined) {
      gridClasses += `summary-builder--grid-cols-${config.columns} `;
    }
    if (config.twoColumnsOnMobile) {
      gridClasses += `summary-builder--grid-cols-2-mobile `;
    }
    return gridClasses;
  });

  private previousSummaryConfig: Record<string, any> | undefined;

  private readonly handleUpdatedConfig = effect(() => {
    const currentSummaryConfig: Record<string, SummaryDataRenderer> = this.config();
    if (currentSummaryConfig === this.previousSummaryConfig) {
      return;
    }
    this.previousSummaryConfig = currentSummaryConfig;
    this.configChange.emit(this.config());
  });
}
