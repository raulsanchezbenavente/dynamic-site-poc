import { Query } from '../../../CQRS';

export interface GetAccountQuery extends Query {
  id: string;
}
