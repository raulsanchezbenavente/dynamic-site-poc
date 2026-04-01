import { Command } from '../../../../CQRS';

import { RemoveServiceCommand } from './remove-service.command';

export interface RemoveServicesCommand extends Command {
  services: RemoveServiceCommand[];
}
