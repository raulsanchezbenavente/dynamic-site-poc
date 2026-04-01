import { ContactsCommunicationChannelScope } from '../enums/contacts-communication-channel-scope.enum';

export interface ContactsPersonCommunicationChannel {
  type?: string;
  info?: string;
  prefix?: string;
  cultureCode?: string;
  scope?: ContactsCommunicationChannelScope;
  additionalData?: string;
}
