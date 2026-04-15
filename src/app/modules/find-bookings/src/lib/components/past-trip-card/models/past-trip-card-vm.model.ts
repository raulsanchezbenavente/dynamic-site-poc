import { JourneyLocation, JourneySchedule, SegmentVM } from '@dcx/ui/libs';

export interface PastTripCardVM {
  origin: JourneyLocation;
  destination: JourneyLocation;
  schedule: JourneySchedule;
  totalRecords?: number;
  segments: SegmentVM[];
}
