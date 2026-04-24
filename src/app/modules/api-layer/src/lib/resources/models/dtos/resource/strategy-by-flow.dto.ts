import { RequireStrategyType } from '../enums/require-strategy-type.enum';
import { SessionFlowType } from '../enums/session-flow-type.enum';

export interface StrategyByFlow {
  flow: SessionFlowType;
  strategy: RequireStrategyType;
}
