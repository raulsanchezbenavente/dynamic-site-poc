import { Command } from '../../../../CQRS';

import { RemoveSeatServiceCommand } from './remove-seat-service.command';

export interface RemoveSeatServicesCommand extends Command {
  services: RemoveSeatServiceCommand[];
}
