import { Inject, Injectable, LOCALE_ID, Optional, Pipe, PipeTransform } from '@angular/core';

import { BUSINESS_CONFIG } from '../injection-tokens';
import { BusinessConfig, IbeFlow } from '../model';
import { CurrencyService } from '../services/currency.service';
import { SessionData, SessionStore } from '../session';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class CurrencySymbolPipe implements PipeTransform {
  private bookingCurrency = '';
  private selectedCurrency = '';

  constructor(
    private readonly sessionStore: SessionStore,
    private readonly currencyService: CurrencyService,
    @Inject(BUSINESS_CONFIG) @Optional() protected readonly businessConfig: BusinessConfig | null,
    @Inject(LOCALE_ID) private readonly locale: string
  ) {
    this.sessionStore.sessionData$.subscribe((res) => {
      this.switchTypeBooking(res);
    });
  }

  public transform(value: string): string {
    const currency = this.selectedCurrency === this.bookingCurrency ? this.selectedCurrency : value;
    if (currency) {
      return this.getCurrencySymbol(currency);
    } else {
      return '';
    }
  }

  private getCurrencySymbol(currencyCode: string): string {
    try {
      const parts = Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: currencyCode,
      }).formatToParts();

      const currencyPart = parts.find((part) => part.type === 'currency');
      return currencyPart?.value || currencyCode;
    } catch {
      return currencyCode;
    }
  }

  private switchTypeBooking(res: SessionData): void {
    switch (res.session.flow) {
      case IbeFlow.WCI:
        this.bookingCurrency = res.session.booking.pricing.currency;
        break;

      case IbeFlow.MMB:
        this.bookingCurrency = res.session.booking.pricing.currency;
        break;

      default:
        this.selectedCurrency = this.currencyService.getCurrentCurrency();
        this.bookingCurrency = res.session.booking.pricing.currency;
        break;
    }
  }
}
