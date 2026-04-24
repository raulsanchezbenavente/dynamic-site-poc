import { CheckinRequest } from '../../..';
import { Query } from '../../../../CQRS';

export interface CheckinPaxQuery extends Query {
  segmentsPaxCheckin: CheckinRequest[];
}
