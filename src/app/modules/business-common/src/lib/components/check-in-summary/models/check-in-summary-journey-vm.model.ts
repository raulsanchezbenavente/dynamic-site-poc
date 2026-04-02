import { JourneyVM, TimeMeasureModel } from '@dcx/ui/libs';

import { CheckInSummaryPassengerVM } from './check-in-summary-passenger-vm.model';

export interface CheckInSummaryJourneyVM extends JourneyVM {
  isCheckInAvailable: boolean;
  passengers: CheckInSummaryPassengerVM[];
  remainingTimeToCheckIn?: TimeMeasureModel;
}
