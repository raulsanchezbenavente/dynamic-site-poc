import { Booking } from '../booking';
import { ScheduleSelection } from '../schedule-selector';

export interface SummaryTypologyDataVmParams {
  booking: Booking;
  departureLabel: string;
  returnLabel: string;
  servicesLabel: string;
  taxesLabel: string;
  scheduleSelection: ScheduleSelection;
  servicesCodesToMerge: string[];
  excludeChargesCode: string[];
  showInfoForSelectedFlight: boolean;
}
