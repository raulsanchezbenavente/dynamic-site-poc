import { SegmentWithSelectedPassengers } from '../../api-models';
import { Booking } from '../../model';

export interface ISummarySelectedJourneysService {
  getSelectedJourneysToCheckIn(booking: Booking): string[];
  getSelectedPassengers(): SegmentWithSelectedPassengers[];
  getJourneysToRequest(): string[];
}
