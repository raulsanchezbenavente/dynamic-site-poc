import { PaxTypeCode } from '../../enums';

export interface PassengerTypesVM {
  config: PassengerTypesConfig[];
}

export interface PassengerTypesConfig {
  code: PaxTypeCode;
  quantity: number;
}
