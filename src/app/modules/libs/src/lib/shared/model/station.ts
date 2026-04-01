import { GeoPosition } from './position';

export interface Station {
  cityCode?: string;
  code: string;
  countryCode: string;
  cultureCode: string;
  macCode: string;
  name: string;
  position: GeoPosition;
  timeZoneCode: string;
  isExternalStation?: boolean;
}
