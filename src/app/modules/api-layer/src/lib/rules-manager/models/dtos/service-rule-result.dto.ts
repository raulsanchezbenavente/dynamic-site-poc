import { ChangeStrategy } from './enums/change-strategy.enum';
import { PriceStrategy } from './enums/price-strategy.enum';
import { RulesManagerServiceType } from './enums/rules-manager-service-type.enum';
import { SpoilStrategy } from './enums/spoil-strategy.enum';
import { RulesManagerTransactionStatus } from './enums/rules-manager-transaction-status.enum';

export interface ServiceRuleResult {
  status: RulesManagerTransactionStatus;
  isIncludedInBundle: boolean;
  serviceCode: string;
  serviceType: RulesManagerServiceType;
  ruleId: string;
  changeStrategy: ChangeStrategy;
  priceStrategy: PriceStrategy;
  spoilStrategy: SpoilStrategy;
}
