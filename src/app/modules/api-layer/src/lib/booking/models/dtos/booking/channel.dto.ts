import { CommunicationChannelScope } from '../../..';

export interface PersonCommunicationChannel {
  type?: string;
  info?: string;
  prefix?: string;
  cultureCode?: string;
  scope?: CommunicationChannelScope;
  additionalData?: string;
}
