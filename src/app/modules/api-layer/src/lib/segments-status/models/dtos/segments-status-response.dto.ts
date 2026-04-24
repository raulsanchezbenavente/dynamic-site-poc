import { SegmentStatusDto } from './segment-status.dto';

export interface SegmentsStatusResponse {
  requestDate: Date;
  segments: SegmentStatusDto[];
}
