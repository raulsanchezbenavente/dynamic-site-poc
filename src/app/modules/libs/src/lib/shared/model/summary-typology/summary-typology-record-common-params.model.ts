import { Bundle } from '../bundle';
import { Charge } from '../charge';
import { Service } from '../service';

import { SummaryTypologyDataVm } from './summary-typology-vm';

export interface SummaryTypologyRecordCommonParams {
  summaryTypologyDataVm: SummaryTypologyDataVm;
  codeWithoutSpaces: string;
  principalCharge: Charge;
  services: Service[];
  bundles: Bundle[];
}
