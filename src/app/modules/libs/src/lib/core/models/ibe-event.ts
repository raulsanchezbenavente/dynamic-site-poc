import { IbeEventRedirect } from './ibe-event-redirect';
import { IbeEventTypeEnum } from './ibe-event-type';

export interface IbeEvent {
  type: IbeEventTypeEnum;
  key?: string;
  payload?: any;
  redirectUrl?: IbeEventRedirect;
  page?: string;
  actionOnSubmit?: any;
  attempts?: number;
  culture?: string;
  success?: boolean;
}
