import { Command } from '../../../../CQRS';

import { JourneyRequest } from './journey-request.model';

export interface AddJourneyCommand extends Command {
  journeys: JourneyRequest[];
}
