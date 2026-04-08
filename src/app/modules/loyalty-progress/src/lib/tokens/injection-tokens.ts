import { InjectionToken, Provider } from '@angular/core';

import { LoyaltyProgressBuilderInterface } from '../interfaces/loyalty-progress-builder.interface';
import { LoyaltyProgressBuilderService } from '../services/loyalty-progress-builder.service';

export const LOYALTY_PROGRESS_BUILDER_SERVICE = new InjectionToken<LoyaltyProgressBuilderInterface>(
  'LOYALTY_PROGRESS_BUILDER_SERVICE'
);
export const LOYALTY_PROGRESS_BUILDER_PROVIDER: Provider = {
  provide: LOYALTY_PROGRESS_BUILDER_SERVICE,
  useClass: LoyaltyProgressBuilderService,
};
