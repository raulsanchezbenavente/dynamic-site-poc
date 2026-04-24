import { Command } from '../../../../CQRS';

import { UnconfirmSeatServiceCommand } from './unconfirm-seat-service.command';

export interface UnconfirmSeatServicesCommand extends Command {
  seatServices: UnconfirmSeatServiceCommand[];
}
