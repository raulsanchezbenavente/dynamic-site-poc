import { Channel } from './../model/channel';
import { Document } from './../model/document';
import { BillingInfo } from './billing-info.model';

export interface BookingContact {
  id: string;
  type: string;
  mktOption: boolean;
  personInfo?: {
    gender?: string;
    weight?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  name: {
    title?: string;
    first: string;
    middle?: string;
    last: string;
  };
  /**
   * Make address optional. For AV address is not obligatory
   */
  address?: {
    country?: string;
    province?: string;
    city?: string;
    zipCode?: string;
    addressLine: string;
  };
  channels: Channel[];
  documents?: Document[];
  billingInfo?: BillingInfo;
  paxReferenceId?: string;
}
