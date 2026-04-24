import { PaxSegmentCheckinStatus } from '../enums/pax-segment-checkin-status.enum';

import { BoardingPassEligibility } from './boarding-pass-eligibility.model';

export interface SegmentPaxCheckinInfo {
  paxId: string;
  seat: string;
  status: PaxSegmentCheckinStatus;
  hasMissingDocuments: boolean;
  canDownloadBoardingPass: boolean;
  boardingPassEligibility?: BoardingPassEligibility;
}
