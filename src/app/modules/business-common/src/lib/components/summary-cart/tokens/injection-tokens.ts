import { InjectionToken, Provider } from '@angular/core';

import { SummaryCardBuilderInterface } from '../interfaces/summary-cart-builder.interface';
import { SummaryCartBuilderService } from '../services/summary-cart-builder.service';

export const SUMMARY_CART_BUILDER_SERVICE = new InjectionToken<SummaryCardBuilderInterface>(
  'SUMMARY_CART_BUILDER_SERVICE'
);

export const SUMMARY_CART_BUILDER_PROVIDER: Provider = {
  provide: SUMMARY_CART_BUILDER_SERVICE,
  useClass: SummaryCartBuilderService,
};
