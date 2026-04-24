import { ApiResponse } from '.';

export interface SessionSettingsResponse extends ApiResponse {
  response: {
    search: SessionSettingsSearch;
    currency: SessionSettingsCurrency;
    pointOfSale?: string;
    countryCode?: string;
    source: string;
  };
}

interface SessionSettingsSearch {
  origin: string;
  destination?: string;
  pax?: PaxTypes;
  tripType?: string;
}

interface SessionSettingsCurrency {
  value: string;
}

export interface PaxTypes {
  ADT: number;
  CHD: number;
  INF: number;
  TNG: number;
}
