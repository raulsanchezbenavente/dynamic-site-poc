import { BookingChangeStrategy, ProductScopeType, TransactionStatus } from '../../..';

export interface Service {
  category: string;
  BookingChangeStrategy: BookingChangeStrategy;
  changeStrategy?: string;
  code: string;
  isChecked: boolean;
  differentialId: string;
  note: string;
  paxId: string;
  referenceId: string;
  scope: ProductScopeType;
  sellKey: string;
  source: string;
  status: TransactionStatus;
  type: string;
  id: string;
  priceAmount?: number;
  expirationDate?: string | null;
}
