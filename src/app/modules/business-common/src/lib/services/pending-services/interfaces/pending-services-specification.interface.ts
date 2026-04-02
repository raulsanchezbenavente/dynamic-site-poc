import { Booking } from '@dcx/ui/libs';

export interface IPendingServicesSpecification {
  isSatisfiedBy(sessionEventBooking: Booking | null): boolean;
}
