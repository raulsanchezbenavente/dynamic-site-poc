import { DictionaryType } from '@dcx/ui/libs';

import { JourneyByPaxRequest } from '../../..';
import { Command } from '../../../../CQRS';

export interface ChangeJourneyByPaxCommand extends Command {
  journeys: DictionaryType<JourneyByPaxRequest>;
}
