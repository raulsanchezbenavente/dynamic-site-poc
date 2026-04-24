import { RulesManagerServiceType } from './enums/rules-manager-service-type.enum';
import { RulesManagerTransactionStatus } from './enums/rules-manager-transaction-status.enum';

export interface ServiceInformation {
  code: string;
  type: RulesManagerServiceType;
  status: RulesManagerTransactionStatus;
  isIncludedInBundle: boolean;
}
