import { AssignSeatMode } from '../../..';

export interface AutoAssignSeatRequest {
  segmentId: string;
  pax: string[];
  assignMode: AssignSeatMode;
}
