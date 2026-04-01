export interface SearchedJourney {
  date: Date;
  origin: string;
  destination: string;
  pax?: {
    ADT?: number;
    CHD?: number;
    INF?: number;
    TNG?: number;
    EXT?: number;
  };
}
