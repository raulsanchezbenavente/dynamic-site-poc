import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PriceBreakdownHeaderVM } from '../../models/price-breakdown-header.config';

@Component({
  selector: 'price-breakdown-header',
  templateUrl: './price-breakdown-header.component.html',
  imports: [NgTemplateOutlet],
  standalone: true,
})
export class PriceBreakdownHeaderComponent {
  @Input({ required: true }) public model!: PriceBreakdownHeaderVM;
  @Output() private readonly collapsedEmitter = new EventEmitter<boolean>();

  public toggleCollapse(): void {
    if (this.model.config.isCollapsible) {
      this.model.isExpanded = !this.model.isExpanded;
      this.collapsedEmitter.emit(!this.model.isExpanded);
    }
  }
}
