import { Query } from '../../../../CQRS';

export interface CancelJourneyQuery extends Query {
  journeys: string[];
}
