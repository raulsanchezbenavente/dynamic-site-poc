import { FindBookingsResponse } from '../api-models/find-bookings-response.model';
import { PastTripCardVM } from '../components/past-trip-card/models/past-trip-card-vm.model';
import { FindBookingsConfig } from '../models/find-bookings.config';

export interface IPastTripsBuilder {
  getData(data: FindBookingsResponse, config: FindBookingsConfig): PastTripCardVM[];
}
