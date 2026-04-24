import { PosChannelType } from '../../..';

export interface PointOfSale {
  agent: { id: string };
  organization: { id: string };
  channelType: PosChannelType;
  posCode: string;
}
