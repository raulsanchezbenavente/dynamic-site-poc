import { SegmentCheckIn } from '@dcx/ui/api-layer';
import { SegmentsStatusByJourney } from '@dcx/ui/business-common';
import { Booking, CarrierVM } from '@dcx/ui/libs';

export interface CheckInSummaryBuilderData {
  booking: Booking;
  segmentsStatusByJourney: SegmentsStatusByJourney[];
  paxSegmentCheckInStatus: SegmentCheckIn[];
  carriers?: CarrierVM[];
}
