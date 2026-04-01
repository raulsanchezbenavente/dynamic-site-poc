import { Query } from '../../../CQRS';

export interface GetResourceQuery extends Query {
  resourceName: string;
  data: string;
  culture: string;
  useDefaultCulture: boolean;
}
