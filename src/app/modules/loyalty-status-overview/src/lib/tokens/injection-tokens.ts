import { InjectionToken } from '@angular/core';

import { LoyaltyStatusOverviewBuilderInterface } from '../interfaces/loyalty-status-overview-builder.interface';
import { LoyaltyStatusOverviewBuilderService } from '../services/loyalty-status-overview-builder.service';

export const LOYALTY_STATUS_OVERVIEW_BUILDER_SERVICE = new InjectionToken<LoyaltyStatusOverviewBuilderInterface>(
  'LOYALTY_STATUS_OVERVIEW_BUILDER_SERVICE'
);

export const LOYALTY_STATUS_OVERVIEW_BUILDER_PROVIDER = {
  provide: LOYALTY_STATUS_OVERVIEW_BUILDER_SERVICE,
  useClass: LoyaltyStatusOverviewBuilderService,
};
