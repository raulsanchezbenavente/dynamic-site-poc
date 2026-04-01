import { Command } from '../../../../CQRS';

export interface ConfirmBaggageCommand extends Command {
  serviceIds: string[];
}
