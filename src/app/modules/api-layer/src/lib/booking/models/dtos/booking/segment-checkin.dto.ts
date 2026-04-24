import { SegmentPaxCheckinInfo } from '../../requests/checkin-pax/segment-pax-checkin-info.model';
import { CheckinStatus } from '../../requests/enums/checkin-status.enum';

export interface SegmentCheckIn {
  segmentId: string;
  pax: SegmentPaxCheckinInfo[];
  status: CheckinStatus;
  hoursToCheckin: number;
  reasonsStatus: string[];
}
