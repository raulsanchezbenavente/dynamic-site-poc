import { Charge } from './../model/charge';

export interface BookingFee {
  feeCode?: string;
  feeType?: number;
  charges?: Charge[];
  passengerId?: string;
  segmentId?: string;
  description?: string;
  isConfirmed?: boolean;
}
