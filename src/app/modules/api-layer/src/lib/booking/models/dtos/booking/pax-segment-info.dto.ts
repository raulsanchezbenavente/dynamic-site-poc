import { BoardingPassEligibility } from '../../requests/checkin-pax/boarding-pass-eligibility.model';

import { CommentDto } from './comment.dto';

export interface PaxSegmentInfo {
  segmentId: string;
  status: string;
  seat: string;
  boardingSequence: string;
  extraSeats?: string[];
  boardingZone: string;
  boardingTime: string;
  reasonsStatus: string[];
  comments: CommentDto[];
  boardingPassEligibility?: BoardingPassEligibility;
}
