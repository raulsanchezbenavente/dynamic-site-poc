import { ChannelScopeType } from '../enums/channel-scope-type.enum';
import { ChannelType } from '../enums/channel-type.enum';

export interface PersonCommunicationChannelDto {
  type: ChannelType;
  scope: ChannelScopeType;
  info: string;
  prefix: string;
  culture: string;
  cultureCode: string;
  additionalData: string;
}
