import { SeatPropertyType } from './enums/seat-property-type.enum';

export interface SeatProperty {
  type: SeatPropertyType;
  value: boolean;
}
