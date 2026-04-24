import { Command } from '../../../../CQRS';

export interface RemoveServiceCommand extends Command {
  ServiceId: string;
}
