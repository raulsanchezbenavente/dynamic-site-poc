import { FareConfig, SsrConfig } from '.';

export interface PointsRequest {
  amount: number;
  fareConfig?: FareConfig;
  ssrConfig?: SsrConfig;
}
