import { ChargeType } from '../../..';

export interface Charge {
  type: ChargeType;
  code: string;
  amount: number;
  currency: string;
}
