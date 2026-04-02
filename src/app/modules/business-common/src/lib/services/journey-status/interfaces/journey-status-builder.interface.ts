import { JourneyStatus } from '@dcx/ui/libs';

import { SegmentsStatusByJourney } from '../../../models';

export interface IJourneyStatusBuilder {
  getData(journeyId: string, segmentsStatus: SegmentsStatusByJourney[]): JourneyStatus | undefined;
}
