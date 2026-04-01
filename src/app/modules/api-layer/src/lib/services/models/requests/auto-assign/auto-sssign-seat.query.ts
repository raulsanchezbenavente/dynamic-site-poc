import { Query } from '../../../../CQRS';

import { AutoAssignSeatRequest } from './auto-assign-seat.request';

export interface AutoAssignSeatQuery extends Query {
  services: AutoAssignSeatRequest[];
}
