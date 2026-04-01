import { Query } from '../../../CQRS';

import { PaymentStatusRequest } from './payment-status.request';

export interface PaymentStatusQuery extends Query {
  request: PaymentStatusRequest;
}
