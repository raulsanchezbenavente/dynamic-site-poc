import { CreateBookingRequest } from '../../..';
import { Command } from '../../../../CQRS';

export interface CreateBookingCommand extends Command {
  request: CreateBookingRequest;
}
