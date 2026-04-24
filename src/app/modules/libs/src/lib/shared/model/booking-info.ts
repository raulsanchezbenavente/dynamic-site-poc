import { TripType } from '../enums';

import { BookingComment } from './../model/booking-comment';
import { Pos } from './../model/pos';
import { QueueInfo } from './../model/queue-info';

export interface BookingInfo {
  recordLocator: string;
  createdDate: string;
  status: string;
  comments: BookingComment[];
  queues: QueueInfo[];
  pointOfSale: Pos;
  currency?: string;
  totalAmount?: number;
  tripType?: TripType;
  referenceId?: string;
}
