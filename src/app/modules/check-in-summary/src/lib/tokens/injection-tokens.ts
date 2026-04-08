import { InjectionToken, Provider } from '@angular/core';

import { CheckInSummaryBuilderService } from '../implementations/check-in-summary-builder.service';
import { ICheckInSummaryBuilder } from '../interfaces/check-in-summary-builder.interface';

export const CHECK_IN_SUMMARY_BUILDER = new InjectionToken<ICheckInSummaryBuilder>('CHECK_IN_SUMMARY_BUILDER');

export const checkInSummaryBuilderProvider: Provider = {
  provide: CHECK_IN_SUMMARY_BUILDER,
  useClass: CheckInSummaryBuilderService,
};
