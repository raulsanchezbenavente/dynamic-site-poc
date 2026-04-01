import { EnumProductScopeType } from '../enums';

export interface Eticket {
  code: string;
  paxId: string;
  referenceId: string;
  scope: EnumProductScopeType;
  sellKey: string;
}
