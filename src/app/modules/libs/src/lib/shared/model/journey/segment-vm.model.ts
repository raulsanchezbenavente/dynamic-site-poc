import { JourneyStatus } from '../../enums/journey/journey-status.enum';

import { JourneyLocation } from './journey-location.model';
import { JourneySchedule } from './journey-schedule.model';
import { LegVM } from './legs/leg-vm.model';
import { Transport } from './transport.model';

export interface SegmentVM {
  id: string;
  referenceId?: string;
  origin: JourneyLocation;
  destination: JourneyLocation;
  schedule: JourneySchedule;
  legs: LegVM[];
  duration?: string;
  transport: Transport;
  status?: JourneyStatus;
  journeyId?: string;
}
