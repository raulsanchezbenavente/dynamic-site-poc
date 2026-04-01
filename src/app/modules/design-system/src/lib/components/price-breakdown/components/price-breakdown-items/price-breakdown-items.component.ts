import { Component, Input } from '@angular/core';
import { DictionaryType } from '@dcx/ui/libs';

import { PriceBreakdownItemsVM } from '../../models/price-breakdown-items.config';
import { PriceBreakdownItemComponent } from "./components/price-breakdown-item/price-breakdown-item.component";

@Component({
  selector: 'price-breakdown-items',
  templateUrl: './price-breakdown-items.component.html',
  imports: [PriceBreakdownItemComponent],
    standalone: true
})
export class PriceBreakdownItemsComponent {
  @Input({ required: true }) public model!: PriceBreakdownItemsVM[];
  @Input({ required: true }) public translations!: DictionaryType;
}
