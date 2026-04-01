import { AvailabilityRequestType } from '../enums/availability-request-type.enum';
import { ScheduleAvailabilityType } from '../enums/schedule-availability-type.enum';

import { FareAdditionalInformation } from './fare-additional-information.dto';
import { PricingFare } from './pricing-fare.dto';
import { PricingSegment } from './pricing-segment.dto';

export interface PricingJourney {
  referenceId: string;
  scheduleType: AvailabilityRequestType;
  segments: PricingSegment[];
  fares: PricingFare[];
  faresAdditionalInformation: FareAdditionalInformation[];
  minTotalAmount: number;
  minDiscountTotalAmount: number;
  priceByCabin: Record<string, number>;
  availability: ScheduleAvailabilityType;
  openingCheckInDate: Date;
  closingCheckInDate: Date;
  recommended: boolean;
}
