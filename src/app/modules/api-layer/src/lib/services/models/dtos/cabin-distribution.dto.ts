import { CabinElement } from './cabin-element.dto';
import { CabinSector } from './cabin-sector.dto';

export interface CabinDistribution {
  rowMin: number;
  rowMax: number;
  sectors: CabinSector[];
  seatMap: CabinElement[][];
}
