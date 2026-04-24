import { BookingInfo, BookingPricing, Bundle, Contact, Eticket, Journey, Pax, Payment, Service } from '../../..';

export interface Booking {
  bookingInfo: BookingInfo;
  bundles: Bundle[];
  contacts: Contact[];
  etickets: Eticket[];
  hasDisruptions: boolean;
  id: string;
  journeys: Journey[];
  pax: Pax[];
  payments: Payment[];
  pricing: BookingPricing;
  services: Service[];
}
