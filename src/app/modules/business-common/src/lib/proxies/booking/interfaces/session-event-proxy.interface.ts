import { Booking } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

/**
 * Interface for SessionEvent proxy service
 * Retrieves booking data from session event endpoint with etickets and services information
 */
export interface ISessionEventProxyInterface {
  /**
   * Gets the booking from session event
   */
  getSessionEventBooking(): Observable<Booking>;
}
