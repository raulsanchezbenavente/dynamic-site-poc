import { JourneyType } from '../../enums/journey-type.enum';
import { JourneyStatus } from '../../enums/journey/journey-status.enum';

import { Fare } from './fare/fare.model';
import { JourneyCheckInInfo } from './journey-checkin-info.model';
import { JourneyLocation } from './journey-location.model';
import { JourneySchedule } from './journey-schedule.model';
import { SegmentVM } from './segment-vm.model';
import { TotalPaxVm } from './total-pax-vm';

export interface JourneyVM {
  id: string;
  origin: JourneyLocation;
  destination: JourneyLocation;
  schedule: JourneySchedule;
  segments: SegmentVM[];
  duration: string;
  journeyType?: JourneyType;
  totalPax?: TotalPaxVm[];
  fares?: Fare[];
  status?: JourneyStatus;
  checkinInfo?: JourneyCheckInInfo;
}
