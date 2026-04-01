import { Queue } from '../../..';
import { Command } from '../../../../CQRS';

export interface RemoveQueueCommand extends Command {
  queue: Queue;
}
