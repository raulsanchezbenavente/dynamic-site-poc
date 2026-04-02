import { PaxSegmentCheckinStatus, PaxSegmentInfo } from '@dcx/ui/api-layer';

export interface CheckInSummaryPassengerVM {
  id: string;
  name: string;
  detail?: string;
  lifemilesNumber: string;
  seats?: string[];
  status: PaxSegmentCheckinStatus;
  referenceId: string;
  canDownloadBoardingPass?: boolean;
  segmentsInfo?: PaxSegmentInfo[];
}
