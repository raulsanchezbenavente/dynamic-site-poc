import { IbeEventRedirectType } from './ibe-event-redirect-type';

export interface IbeEventRedirect {
  url: string;
  type: IbeEventRedirectType;
  target?: string;
}
