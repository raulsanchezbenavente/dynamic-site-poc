import { Query } from '../../../CQRS';

import { JourneyPriceRequest } from './journey-price.request';

export interface RetrieveJourneyPricingQuery extends Query {
  customerId: string;
  prospectid: string;
  journeyPriceRequests: JourneyPriceRequest[];
}
