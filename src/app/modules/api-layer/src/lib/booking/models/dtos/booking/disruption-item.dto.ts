import { DisruptionAction, DisruptionInfo } from '../../..';

export interface DisruptionItem {
  disruptionInfo: DisruptionInfo;
  disruptionActions: DisruptionAction[];
}
