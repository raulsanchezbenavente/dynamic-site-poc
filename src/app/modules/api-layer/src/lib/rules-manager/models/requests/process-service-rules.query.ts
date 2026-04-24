import { Query } from '../../../CQRS';

import { ProcessServiceRulesRequest } from './process-service-rules.request';

export interface ProcessServiceRulesQuery extends Query {
  request: ProcessServiceRulesRequest;
}
