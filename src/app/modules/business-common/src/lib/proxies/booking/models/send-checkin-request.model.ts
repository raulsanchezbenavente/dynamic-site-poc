export interface SendCheckinRequest {
  authenticationToken?: string;
  segmentsPaxCheckin: SegmentPaxCheckin[];
}

export interface SegmentPaxCheckin {
  segmentId: string;
  pax: string[];
  isExternalCheckInProcess?: boolean;
  culture: string;
}
