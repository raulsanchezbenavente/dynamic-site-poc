import { Charge } from './../model/charge';

export interface ServicePrice {
  id: string;
  info: ServiceInfo;
  availability: ServiceAvailability[];
  sellType: string;
}

export interface ServiceInfo {
  code: string;
  type: string;
  name: string;
  category: string;
}

export interface ServiceAvailability {
  sellKey: string;
  isInventoried: boolean;
  availableUnits: number;
  limitPerPax: number;
  paxId?: string;
  expirationDate: Date;
  charges: Charge[];
}
