import type { Booking } from '@dcx/ui/libs';

import { BOOKING_CONTACT_BC_FAKE } from './booking-contact-bc.fake';
import { BOOKING_INFO_BC_FAKE } from './booking-info-bc.fake';
import { JOURNEYS_BC_FAKE } from './journeys-bc.fake';
import { PASSENGERS_BC_FAKE } from './passenger-bc.fake';
import { PRICING_BC_FAKE } from './pricing-bc.fake';
import { SERVICE_BC_FAKE } from './service-bc.fake';

/**
 * Represents a fake Booking (`BOOKING_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Booking} BOOKING_BC_FAKE.
 */
export const BOOKING_BC_FAKE: Booking = {
  journeys: JOURNEYS_BC_FAKE,
  pax: PASSENGERS_BC_FAKE,
  contacts: BOOKING_CONTACT_BC_FAKE,
  payments: [],
  services: SERVICE_BC_FAKE,
  bookingInfo: BOOKING_INFO_BC_FAKE,
  pricing: PRICING_BC_FAKE,
  bundles: [],
  bookingFees: [],
  etickets: [],
};
