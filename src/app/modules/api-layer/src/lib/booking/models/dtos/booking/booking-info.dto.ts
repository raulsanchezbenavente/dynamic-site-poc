import { BookingStatus, PointOfSale, Queue, TripType } from '../../..';

export interface BookingInfo {
  referenceId: string;
  recordLocator: string;
  comments: Comment[];
  queues: Queue[];
  status: BookingStatus;
  createdDate: Date;
  pointOfSale: PointOfSale;
  prospectId: string;
  tripType: TripType;
}
