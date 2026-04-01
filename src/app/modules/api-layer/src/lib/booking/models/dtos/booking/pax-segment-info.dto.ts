import { CommentDto } from '../../..';

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
}
