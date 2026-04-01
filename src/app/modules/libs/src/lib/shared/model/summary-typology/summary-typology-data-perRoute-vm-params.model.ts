import { Booking } from '../booking';
import { ScheduleSelection } from '../schedule-selector';

import { SellTypeOfService } from './sell-type-of-service-vm.model';

export interface SummaryTypologyDataPerRouteVmParams {
  booking: Booking;
  departureLabel: string;
  returnLabel: string;
  servicesLabel: string;
  taxesLabel: string;
  scheduleSelection: ScheduleSelection;
  servicesCodesToMerge: string[];
  excludeChargesCode: string[];
  sellTypePerServices: SellTypeOfService[];
  chargesCodesToMerge: string[];
  showInfoForSelectedFlight: boolean;
}
