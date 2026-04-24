import { ScheduleAvailabilityType } from '../enums/schedule-availability-type.enum';

import { PricingJourney } from './pricing-journey.dto';

export interface Schedule {
  date: Date;
  availability: ScheduleAvailabilityType;
  journeys: PricingJourney[];
}
