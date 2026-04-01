import { BillingInfo, BookingContactType, Person } from '../../..';

export interface Contact extends Person {
  type: BookingContactType;
  billingInfo: BillingInfo;
  mktOption: boolean;
  id: string;
  referenceId: string;
  paxReferenceId: string;
}
