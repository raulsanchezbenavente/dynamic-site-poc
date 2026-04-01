import { CabinElementType } from './enums/cabin-element-type.enum';
import { SeatInfo } from './seat-info.dto';

export interface CabinElement {
  type: CabinElementType;
  spaces: number;
  seatInfo: SeatInfo;
}
