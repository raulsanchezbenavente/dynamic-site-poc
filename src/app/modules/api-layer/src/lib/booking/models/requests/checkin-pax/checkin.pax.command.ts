import { Command } from '../../../../CQRS';

import { CheckinRequest } from './checkin.request';

export interface CheckinPaxCommand extends Command {
  segmentsPaxCheckin: CheckinRequest[];
}
