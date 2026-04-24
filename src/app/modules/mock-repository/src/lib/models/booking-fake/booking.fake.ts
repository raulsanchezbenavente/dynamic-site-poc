import { Booking } from '@dcx/ui/libs';

import { BOOKING_CONTACT_FAKE } from './booking-contact.fake';
import { BOOKING_INFO_FAKE } from './booking-info.fake';
import { JOURNEYS_FAKE } from './journeys.fake';
import { PASSENGERS_FAKE } from './passenger.fake';
import { PRICING_FAKE } from './pricing.fake';

export const BOOKING_FAKE: Booking = {
  journeys: JOURNEYS_FAKE,
  pax: PASSENGERS_FAKE,
  contacts: BOOKING_CONTACT_FAKE,
  payments: [],
  services: [],
  bookingInfo: BOOKING_INFO_FAKE,
  pricing: PRICING_FAKE,
  bundles: [],
  bookingFees: [],
  etickets: [],
};
