import { AccessibilityConfig } from '@dcx/ui/libs';
import { PriceBreakdownHeaderVM } from './price-breakdown-header.config';
import { PriceBreakdownItemsVM } from './price-breakdown-items.config';

export interface PriceBreakdownVM {
  config: PriceBreakdownConfig[];
}

export interface PriceBreakdownConfig {
  header: PriceBreakdownHeaderVM;
  list: PriceBreakdownItemsVM[];
  accessibilityConfig: AccessibilityConfig;
}
