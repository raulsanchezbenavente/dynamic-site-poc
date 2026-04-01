import { PaxSegmentCheckinStatus } from '../enums/pax-segment-checkin-status.enum';

export interface SegmentPaxCheckinInfo {
  paxId: string;
  seat: string;
  status: PaxSegmentCheckinStatus;
  hasMissingDocuments: boolean;
  canDownloadBoardingPass: boolean;
}
