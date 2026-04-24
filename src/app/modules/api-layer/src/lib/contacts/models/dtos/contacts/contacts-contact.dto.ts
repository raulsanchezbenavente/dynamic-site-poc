import { ContactsContactType } from '../enums/contacts-contact-type.enum';

import { ContactsBillingInfo } from './contacts-billing-info.dto';
import { ContactsPerson } from './contacts-person.dto';

export interface ContactsContact extends ContactsPerson {
  type: ContactsContactType;
  billingInfo?: ContactsBillingInfo;
  mktOption: boolean;
  id: string;
  referenceId?: string;
  paxReferenceId?: string;
}
