import { DictionaryType } from '@dcx/ui/libs';

import { JourneyRequest } from '../../..';
import { Command } from '../../../../CQRS';

export interface ChangeJourneyCommand extends Command {
  journeys: DictionaryType<JourneyRequest>;
}
