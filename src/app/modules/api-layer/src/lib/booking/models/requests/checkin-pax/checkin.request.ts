export interface CheckinRequest {
  segmentId: string;
  pax: string[];
  isExternalCheckInProcess?: boolean;
  culture: string;
}
