import { AlertItem } from '.';

export interface Alert {
  alertItems: AlertItem[];
  hasCloseOption: boolean;
  rootNodeId: number;
}
