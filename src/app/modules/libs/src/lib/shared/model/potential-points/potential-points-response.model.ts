import { ApiResponse } from '../../api-models';

import { PointsResponse } from '.';

export interface PotentialPointsResponse extends ApiResponse {}

export interface PotentialPointsVm {
  currency: string;
  potentialPoints: PointsResponse[];
}
