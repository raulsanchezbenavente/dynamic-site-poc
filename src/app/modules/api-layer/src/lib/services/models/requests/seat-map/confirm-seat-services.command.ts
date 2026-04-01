import { Command } from '../../../../CQRS';

import { ConfirmSeatServiceCommand } from './confirm-seat-service.command';

export interface ConfirmSeatServicesCommand extends Command {
  seatServices: ConfirmSeatServiceCommand[];
}
