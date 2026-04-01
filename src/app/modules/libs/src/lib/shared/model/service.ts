import { EnumSellType } from '../enums';

import { EnumChangeSpecificationService } from './../enums/enum-change-specification-service';

export interface Service {
  id: string;
  referenceId: string;
  code: string;
  sellKey: string;
  paxId: string;
  status?: string;
  type: string;
  scope: EnumSellType;
  name?: string;
  inventoried?: boolean;
  bundledServices?: string[];
  capacity?: number;
  changeStrategy?: EnumChangeSpecificationService;
  category?: string;
  note?: string;
  source?: string;
  isChecked?: boolean; //Indicates when a previusly contracted service is confirmed by the user,
  priceAmount?: number;
  selectedUnits?: number;

}
