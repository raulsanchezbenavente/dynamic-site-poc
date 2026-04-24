import { Command } from '../../../../CQRS';

import { AddServiceCommand } from './add-service.command';

export interface AddServicesCommand extends Command {
  services: AddServiceCommand[];
}
