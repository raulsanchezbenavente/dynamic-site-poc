import { DataEventModel } from '../models/data-event.model';

export interface ITrackAnalyticsErrorInterface {
  trackAnalyticsError(dataEvent: DataEventModel): void;
}
