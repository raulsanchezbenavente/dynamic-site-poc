import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { BUSINESS_CONFIG, BusinessConfig } from '@dcx/ui/libs';

import { culturalSettings } from './enums/dictionary-culture-currency-conventions';
import { SummaryCartCurrencyConverterConfig } from './models/summary-cart-currency-converter.config';
import { TranslateModule } from "@ngx-translate/core";
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationKeys } from '../../../../enums/translation-keys.enum';

@Component({
  selector: 'summary-currency-convert',
  templateUrl: './summary-cart-currency-converter.component.html',
  styleUrls: ['./styles/summary-cart-currency-converter.styles.scss'],
  host: { class: 'summary-cart-currency-converter' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, NgbAccordionModule],
    standalone: true
})
export class SummaryCartCurrencyConverterComponent {
  protected readonly translationKeys = TranslationKeys;

  public readonly config = input.required<SummaryCartCurrencyConverterConfig>();
  public priceConverted = computed<string>(() => this.buildPriceConverted());
  public isOpen = signal<boolean>(false);

  private readonly culturalSettings = culturalSettings;

  private readonly businessConfig = inject<BusinessConfig>(BUSINESS_CONFIG);

  public formatNumber(number: number): string {
    const cultureKey = this.config().culture as keyof typeof this.culturalSettings;
    const culturalConfig = this.culturalSettings[cultureKey] || this.culturalSettings['other'];

    // Separate thousands and format
    const parts = number.toFixed(2).toString().split('.');
    if (this.config().culture !== this.businessConfig.cultureAlias['fr-FR']) {
      parts[0] = parts[0].replaceAll(/\B(?=(\d{3})+(?!\d))/g, culturalConfig.thousandsSeparator);
    }

    // Ensure there are always two decimals
    parts[1] = parts[1] ? parts[1].padEnd(2, '0') : '00';

    // Join the parts with the decimal separator
    return parts.join(culturalConfig.decimalSeparator);
  }

  public buildPriceConverted(): string {
    return `${this.config().currency} ${this.formatNumber(this.config().price)} = ${this.config().targetCurrency} ${this.formatNumber(this.config().convertedPrice)}`;
  }

  public onClickToggle(): void {
    this.isOpen.update((current) => !current);
  }
}
