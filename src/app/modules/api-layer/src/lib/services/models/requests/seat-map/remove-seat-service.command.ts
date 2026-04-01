import { Command } from '../../../../CQRS';

export interface RemoveSeatServiceCommand extends Command {
  serviceId: string;
}
