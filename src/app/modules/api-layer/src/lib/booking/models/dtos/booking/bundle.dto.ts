import { ProductScopeType, TransactionStatus } from '../../..';

export interface Bundle {
  referenceId: string;
  code: string;
  status: TransactionStatus;
  scope: ProductScopeType;
  paxId: string;
  sellKey: string;
  services: string[];
}
