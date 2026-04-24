import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PriceCurrencyComponent } from '../../../../../price-currency/price-currency.component';
import { PriceBreakdownItemVM } from '../../../../models/price-breakdown-items.config';

import { TranslationKeys } from './enums/translation-keys.enum';

@Component({
  selector: 'price-breakdown-item',
  templateUrl: './price-breakdown-item.component.html',
  imports: [TranslateModule, PriceCurrencyComponent],
  standalone: true,
})
export class PriceBreakdownItemComponent {
  protected readonly TranslationKeys = TranslationKeys;

  @Input() model!: PriceBreakdownItemVM;
}
