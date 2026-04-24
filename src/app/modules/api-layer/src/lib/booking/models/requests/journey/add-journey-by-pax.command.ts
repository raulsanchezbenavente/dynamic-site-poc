import { DictionaryType } from '@dcx/ui/libs';

import { Command } from '../../../../CQRS';

export interface AddJourneyByPaxCommand extends Command {
  journeys: JourneyByPaxRequest[];
}

export interface JourneyByPaxRequest {
  journeyId: string;
  fareByPax: DictionaryType;
  promoCode: string;
  corporateCode: string;
}
