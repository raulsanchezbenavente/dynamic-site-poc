import type { AfterViewInit } from '@angular/core';
import { Component, effect, input } from '@angular/core';

import { SummaryDataRenderer } from './models/summary-data-renderer.model';

@Component({
  selector: 'ds-summary-renderer',
  templateUrl: './summary-renderer.component.html',
  styleUrl: './styles/summary-renderer.component.scss',
  imports: [],
    standalone: true
})
export class DsSummaryRendererComponent implements AfterViewInit {
  public labelId: string = Math.random().toString(36).substring(2, 17);
  public config = input<Record<string, SummaryDataRenderer>>({});

  private previousSummaryConfig: Record<string, any> | undefined;
  private callInAfterViewInit: boolean = false;

  private readonly registerEffect = effect(() => {
    const currentSummaryConfig: Record<string, SummaryDataRenderer> = this.config();
    if (currentSummaryConfig === this.previousSummaryConfig) {
      return;
    }
    this.previousSummaryConfig = currentSummaryConfig;
    this.allocateControlsInWildcards();
  });

  public ngAfterViewInit(): void {
    if (this.callInAfterViewInit) {
      this.allocateControlsInWildcards();
    }
    this.callInAfterViewInit = false;
  }

  public allocateControlsInWildcards(): void {
    const projection: HTMLElement | null = document.getElementById('summary-data-projection-' + this.labelId);
    if (projection) {
      for (const key in this.config()) {
        if (this.config().hasOwnProperty(key)) {
          const labelEl = projection?.querySelector<HTMLElement>(`[summary-data-label="${key}"]`);
          const valueEl = projection?.querySelector<HTMLElement>(`[summary-data-value="${key}"]`);

          if (labelEl) {
            labelEl.innerHTML = this.config()[key].label;
          }
          if (valueEl) {
            valueEl.innerHTML = this.config()[key].value;
          }
        }
      }
    } else {
      this.callInAfterViewInit = true;
    }
  }
}
