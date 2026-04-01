import { Query } from '../../../CQRS';

import { ServicePricingRequest } from './service-pricing.request';

export interface RetrieveServicePricingQuery extends Query {
  request: ServicePricingRequest;
}
