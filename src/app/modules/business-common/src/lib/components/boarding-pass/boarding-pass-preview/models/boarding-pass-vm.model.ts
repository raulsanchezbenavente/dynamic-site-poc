import { BoardingPassSegmentVM } from './boarding-pass-segment-vm.model';

export interface BoardingPassVM {
  passengerName: string;
  paxId: string;
  segments: BoardingPassSegmentVM[];
}
