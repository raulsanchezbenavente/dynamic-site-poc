import { BookingContact } from './../model/booking-contact';
import { BookingFee } from './../model/booking-fee';
import { BookingInfo } from './../model/booking-info';
import { Passenger } from './../model/passenger';
import { Payment } from './../model/payment';
import { Pricing } from './../model/pricing';
import { Service } from './../model/service';
import { Bundle } from './bundle';
import { Eticket } from './eticket.model';
import { JourneyVM } from './journey/journey-vm.model';

export interface Booking {
  bookingInfo: BookingInfo;
  pax: Passenger[];
  journeys: JourneyVM[];
  payments: Payment[];
  contacts: BookingContact[];
  pricing: Pricing;
  services: Service[];
  bundles?: Bundle[];
  bookingFees?: BookingFee[];

  /**
   * AV properties
   */
  etickets?: Eticket[];
  hasDisruptions?: boolean;
}
