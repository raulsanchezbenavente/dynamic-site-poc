import { DictionaryType } from '@dcx/ui/libs';

import { Query } from '../../../../CQRS';

export interface CancelJourneyByPaxQuery extends Query {
  journeysByPax: DictionaryType<string[]>;
}
