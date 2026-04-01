import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DictionaryType } from '@dcx/ui/libs';

import { PriceBreakdownVM } from './models/price-breakdown.config';
import { PriceBreakdownHeaderComponent } from "./components/price-breakdown-header/price-breakdown-header.component";
import { PriceBreakdownItemsComponent } from "./components/price-breakdown-items/price-breakdown-items.component";

@Component({
  selector: 'price-breakdown',
  templateUrl: './price-breakdown.component.html',
  styleUrls: ['./styles/price-breakdown.style.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [PriceBreakdownHeaderComponent, PriceBreakdownItemsComponent],
    standalone: true
})
export class PriceBreakdownComponent {
  @Input({ required: true }) public translations!: DictionaryType;
  public ariaHiddenItems: boolean[];
  private _config!: PriceBreakdownVM;

  constructor() {
    this.ariaHiddenItems = [];
  }

  @Input({ required: true }) set model(value: PriceBreakdownVM) {
    this._config = value;
    this.initItemsCollapsed();
  }

  get model(): PriceBreakdownVM {
    return this._config;
  }

  public collapsedEmitter(isCollapsed: boolean, index: number): void {
    this.ariaHiddenItems[index] = isCollapsed;
  }

  protected initItemsCollapsed(): void {
    for (const [index, priceBreakdown] of this.model.config.entries()) {
      const isCollapsed = priceBreakdown.header.isCollapsed ?? true;

      this.setAriaHiddenItems(index, isCollapsed);
      priceBreakdown.header.isExpanded = !this.ariaHiddenItems[index];
    }
  }

  protected setAriaHiddenItems(index: number, isCollapsed: boolean): void {
    this.ariaHiddenItems[index] = this.ariaHiddenItems[index] ? this.ariaHiddenItems[index] : isCollapsed;
  }
}
