import { SegmentStatus } from '@dcx/ui/api-layer';

export interface SegmentsStatusByJourney {
  journeyId: string;
  segmentsStatus: CheckInSegmentStatus[];
}

export interface CheckInSegmentStatus {
  origin: string;
  destination: string;
  std: Date;
  etd: Date;
  atd: Date;
  sta: Date;
  eta: Date;
  ata: Date;
  stdutc: Date;
  stautc: Date;
  atdutc: Date;
  atautc: Date;
  status: SegmentStatus;
  duration?: string;
}
