import { ButtonConfig } from '@dcx/ui/libs';

import { PriceDisplay } from './amount-currency.model';
export interface AmountSummaryVM {
  priceDisplay: PriceDisplay;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  previousButton?: ButtonConfig;
  nextButton?: ButtonConfig;
}
