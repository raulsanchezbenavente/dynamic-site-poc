import { PointsRequest } from '.';

export interface PotentialPointsRequest {
  programCode: string;
  tierCode?: string;
  loyaltyId?: string;
  currency: string;
  potentialPoints: PointsRequest[];
}
