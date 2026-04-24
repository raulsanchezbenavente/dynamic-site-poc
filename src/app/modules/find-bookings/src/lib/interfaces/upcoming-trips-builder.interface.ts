import { FindBookingsResponse } from '../api-models/find-bookings-response.model';
import { ManageBookingCardVM } from '../components/manage-booking-card/models/manage-booking-card-vm.model';
import { FindBookingsConfig } from '../models/find-bookings.config';

export interface IUpcomingTripsBuilder {
  getData(data: FindBookingsResponse, config: FindBookingsConfig): ManageBookingCardVM[];
}
