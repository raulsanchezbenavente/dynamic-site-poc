import { SeatAvailability } from './enums/seat-availability.enum';
import { SeatProperty } from './seat-property.dto';

export interface SeatInfo {
  seatNumber: string;
  column: string;
  row: number;
  category: string;
  referenceId: string;
  availabilityByPax: { [key: string]: SeatAvailability };
  properties: SeatProperty[];
  extraProperties: { [key: string]: boolean };
}
