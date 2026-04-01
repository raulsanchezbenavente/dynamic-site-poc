import { Command } from '../../../../CQRS';

import { LoginBookingRequest } from './login-booking.request';

export interface LoginBookingCommand extends Command {
  request: LoginBookingRequest;
}
