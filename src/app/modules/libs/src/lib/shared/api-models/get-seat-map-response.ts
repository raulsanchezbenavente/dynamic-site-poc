import { ApiResponse } from './api-response';

export interface GetSeatMapResponse extends ApiResponse<CabinSeatMap> {}

export interface CabinSeatMap {
  decks: Decks[];
  id: string;
  segment: SegmentInfo;
  type: string;
  sufix: string;
  seatMatrix?: SeatMatrixInfo[][];
}

export interface SegmentInfo {
  segmentId: string;
}
export interface Decks {
  number: number;
  cabins?: CabinInfo[];
}

export interface CabinInfo {
  classType: string;
  distributions: Distribution[];
}

export interface Distribution {
  rowMin: number;
  rowMax: number;
  sectors: DistributionSector[];
  seatMap: DistributionSeatMap[][];
}

export interface DistributionSector {
  number: number;
  columns: string[];
}

export interface DistributionSeatMap {
  type: string;
  spaces: number;
  seatInfo?: SeatMatrixInfo;
}

export interface SeatMatrixInfo {
  seatNumber: string;
  column: string;
  row: number;
  category: string;
  availabilityByPax: { [paxId: string]: string };
  properties: SeatPoperties[];
  extraProperties: { [key: string]: boolean };
}

export interface SeatPoperties {
  type: string;
  value: boolean;
}
