import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { SummaryDataRenderer } from '../summary-renderer/models/summary-data-renderer.model';

@Component({
  selector: 'ds-summary-builder',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DsSummaryBuilderComponent {
  @Input() public config: Record<string, SummaryDataRenderer> = {};
  @Output() public configChange = new EventEmitter<Record<string, SummaryDataRenderer>>();
}
