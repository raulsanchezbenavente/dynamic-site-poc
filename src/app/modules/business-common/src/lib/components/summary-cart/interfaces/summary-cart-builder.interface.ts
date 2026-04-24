import { SessionData } from '@dcx/ui/libs';

import { SummaryCartConfig } from '../models/summary-cart.config';

export interface SummaryCardBuilderInterface {
  getData(session: SessionData): SummaryCartConfig;
}
