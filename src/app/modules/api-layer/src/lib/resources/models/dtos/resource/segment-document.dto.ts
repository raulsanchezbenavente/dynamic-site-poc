export interface SegmentDocument {
  code: string;
  minExpiration: string; // Timespan
  maxExpiration: string; // Timespan
  minAge: number;
  maxAge: number;
}
