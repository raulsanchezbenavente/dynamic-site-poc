import { Position } from './position.dto';

export interface Station {
  name: string;
  code: string;
  countryCode: string;
  macCode: string;
  timeZoneCode: string;
  cultureCode: string;
  isExternalStation: boolean;
  position: Position;
  extraProperties: Record<string, object>;
  cityCode: string;
  type: string;
  region: string;
  stationOperationType: Array<string>;
  terminal: string;
}
