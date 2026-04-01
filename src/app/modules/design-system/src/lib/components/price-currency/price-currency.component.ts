import { Component, Inject, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {
  BUSINESS_CONFIG,
  BusinessConfig,
  CultureServiceEx,
  CurrencyFormatPipe,
  roundingCurrencyFactorHelper,
} from '@dcx/ui/libs';

/**
 * Displays price with currency and decimals (optional), allows format amount with currency-format.pipe
 */
@Component({
  selector: 'price-currency',
  templateUrl: './price-currency.component.html',
  styleUrls: ['./styles/price-currency.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ds-price-currency' },
  imports: [CurrencyFormatPipe],
  standalone: true,
})
export class PriceCurrencyComponent implements OnInit {
  @Input({ required: true }) public currency!: string;
  @Input() public prefixText?: string;
  @Input() public suffixText?: string;
  /**
   * Format amount - Possible values: 'IntegerOnly', 'CompleteNumber'
   */
  @Input() public format?: string;
  @Input() public decimalDigits?: number;

  /**
   * Show decimals from business config
   */
  public showDecimals: boolean = false;
  private _price: number = 0;

  private readonly cultureServiceEx = inject(CultureServiceEx);

  constructor(@Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig) {}

  get culture(): string {
    return this.cultureServiceEx.getCulture();
  }

  @Input({ required: true })
  set price(value: number) {
    this._price = Math.abs(value);
  }

  get price(): number {
    return this._price;
  }

  /**
   * OnInit() method. Set default decimal digits and set format if is null
   */
  public ngOnInit(): void {
    this.showDecimals = !this.businessConfig.priceWithoutDecimals;
    this.decimalDigits = this.showDecimals ? this.getDecimalDigits(this.decimalDigits!, this.currency) : 0;

    this.format = !this.format && this.businessConfig.priceWithoutDecimals ? 'CompleteNumber' : this.format;
  }

  /**
   * return decimal digits
   * @param decimalDigits number
   * @param currencyCode currency Code
   * @returns number decimals
   */
  protected getDecimalDigits(decimalDigits: number, currencyCode: string): number {
    if (decimalDigits === undefined) {
      return roundingCurrencyFactorHelper.getRoundingCurrencyFactor(currencyCode, this.businessConfig);
    } else {
      return decimalDigits;
    }
  }
}
