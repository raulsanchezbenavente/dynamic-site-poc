import { Queue } from '../../..';
import { Command } from '../../../../CQRS';

export interface AddQueueCommand extends Command {
  queue: Queue;
}
