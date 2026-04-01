import { RulesManagerPax } from './rules-manager-pax.dto';

export interface BookingInformation {
  fareClass: string;
  pax: RulesManagerPax[];
  origin: string;
  destination: string;
}
