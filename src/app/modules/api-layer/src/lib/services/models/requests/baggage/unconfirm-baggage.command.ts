import { Command } from '../../../../CQRS';

export interface UnconfirmBaggageCommand extends Command {
  serviceIds: string[];
}
