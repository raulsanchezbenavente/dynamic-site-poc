import { Booking } from '../../..';
import { Command } from '../../../../CQRS';

export interface CreateBookingInSessionCommand extends Command {
  booking: Booking;
}
