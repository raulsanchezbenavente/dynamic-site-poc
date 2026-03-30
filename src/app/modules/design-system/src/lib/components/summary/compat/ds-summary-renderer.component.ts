import { Component, Input } from '@angular/core';

import type { SummaryDataRenderer } from '../summary-renderer/models/summary-data-renderer.model';

@Component({
  selector: 'ds-summary-renderer',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DsSummaryRendererComponent {
  @Input() public config: Record<string, SummaryDataRenderer> = {};
}
