import { CheckInSummaryJourneyVM } from '@dcx/ui/business-common';

import { CheckInSummaryBuilderData } from '../models/check-in-summary-builder-data.model';

export interface ICheckInSummaryBuilder {
  buildCheckInSummaryModel(data: CheckInSummaryBuilderData): CheckInSummaryJourneyVM[];
}
