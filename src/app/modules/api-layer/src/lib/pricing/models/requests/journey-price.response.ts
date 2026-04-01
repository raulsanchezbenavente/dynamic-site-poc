import { Schedule } from '../dtos/journeys/schedule.dto';

export interface JourneyPriceResponse {
  id: string;
  currency: string;
  schedules: Schedule[];
}
