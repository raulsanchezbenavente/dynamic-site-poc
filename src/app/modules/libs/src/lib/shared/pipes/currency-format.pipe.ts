import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { currencyFormatHelper } from '../helpers';
import { RoundingService } from '../services';

/**
 * CurrencyFormat pipe
 * Round and Transform an object(string or number) to string with format using culture
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private readonly roundingService: RoundingService) {}

  /**
   * Transform method
   * @param value value to transform
   * @param displayDigit possible values: 'IntegerOnly', 'CompleteNumber'
   * @param currencyCode currency code to round service
   * @param culture culture code (e.g., 'en-US', 'es-ES')
   * @param fixed decimal digits
   */
  public transform(
    value: string | number,
    displayDigit: string,
    currencyCode: string,
    culture: string,
    fixed?: number
  ): string {
    const numericValue = Number(value);
    const decimals = fixed ?? 0;

    // Override spanish language with CO culture variation as per business requirement.
    // This should be removed when the application (CMS+UI) correctly support language+region combinations.
    if (culture === 'es') {
      culture = 'es-CO';
    }

    switch (displayDigit) {
      case 'IntegerOnly':
        return currencyFormatHelper.integerOnly(numericValue, culture);
      case 'FractionalOnly':
        return currencyFormatHelper.fractionalOnly(numericValue, culture, decimals);
      case 'CompleteNumber': {
        const roundedAmount = this.roundingService.roundAmount(currencyCode, numericValue);
        return roundedAmount.toLocaleString(culture, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      default:
        return numericValue.toLocaleString(culture, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  }
}
