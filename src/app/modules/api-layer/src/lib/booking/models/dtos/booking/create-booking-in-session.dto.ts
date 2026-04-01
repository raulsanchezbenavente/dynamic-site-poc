import { Booking } from './booking.dto';

export interface CreateBookingInSessionDto {
  apiSessionId: string;
  booking: Booking;
}
