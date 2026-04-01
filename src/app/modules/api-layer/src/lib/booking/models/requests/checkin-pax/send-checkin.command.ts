import { CheckinRequest } from '../../..';
import { Command } from '../../../../CQRS';

export interface SendCheckinCommand extends Command {
  authenticationToken?: string;
  segmentsPaxCheckin: CheckinRequest[];
}
