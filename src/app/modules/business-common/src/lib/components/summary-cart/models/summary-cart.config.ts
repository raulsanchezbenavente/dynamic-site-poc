import { ButtonConfig } from '@dcx/ui/libs';

import { SummaryCartDetailConfig } from '../components/summary-cart-detail/models/summary-cart-detail.config';

export interface SummaryCartConfig {
  toggleButton: ButtonConfig;
  details: SummaryCartDetailConfig;
}
