import { BoardingPassEligibilityStatus } from '../enums/boarding-pass-eligibility-status.enum';

export interface BoardingPassEligibility {
  boardingPassEligibilityStatus: BoardingPassEligibilityStatus;
  reasons: string[];
}
