import { Inject, Injectable, Optional } from '@angular/core';

import { BUSINESS_CONFIG } from '../injection-tokens';
import { BusinessConfig } from '../model';

@Injectable({ providedIn: 'root' })
export class RoundingService {
  currencies!: [{ code: string; factor: string }];

  constructor(@Optional() @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig) {}

  roundAmount(currencyCode: string, value: number) {
    if (Number.isInteger(value)) {
      return value;
    }
    this.currencies = this.businessConfig?.roundingCurrencyFactors;
    const factorIndex = this.currencies?.findIndex((c) => c.code === currencyCode);
    if (factorIndex > -1) {
      const factor = this.currencies[factorIndex].factor;

      switch (factor) {
        case '0.01': {
          return Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
        }
        case '1': {
          return Math.round(value * Math.pow(10, 0)) / Math.pow(10, 0);
        }
        case '10': {
          return Math.round(value / 10) * 10;
        }
        case '100': {
          return Math.round(value / 100) * 100;
        }
        default: {
          return value;
        }
      }
    } else {
      return Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
    }
  }
}
