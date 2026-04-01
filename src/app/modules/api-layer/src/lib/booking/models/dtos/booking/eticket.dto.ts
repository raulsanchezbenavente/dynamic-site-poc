import { ProductScopeType } from '../../..';

export interface Eticket {
  code: string;
  paxId: string;
  referenceId: string;
  scope: ProductScopeType;
  sellKey: string;
}
