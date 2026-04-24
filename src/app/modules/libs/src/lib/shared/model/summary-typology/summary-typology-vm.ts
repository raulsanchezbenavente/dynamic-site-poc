import { SummaryTypologyDataVmModelType } from '../../enums';

export interface SummaryTypologyDataVm {
  label?: string;
  labelText?: string;
  price?: string;
  currency?: string;
  modelType?: SummaryTypologyDataVmModelType;
  /**
   * Stand-alone service records
   */
  records?: SummaryTypologyRecord[];
  /**
   * Service records that are part of a bundle
   */
  bundledRecords?: SummaryTypologyRecord[];
}
export interface SummaryTypologyRecord {
  code: string;
  currency: string;
  price: number;
  quantity: number;
  type: string;
  serviceType: string;
  chargeType: string;
  sellType?: string;
  relatedServices: SummaryTypologyService[];
  status?: string;
  charges?: GroupedCharges[];
}
export interface SummaryTypologyService {
  referenceId: string;
  sellkey?: string;
  paxId?: string;
}
export interface GroupedCharges {
  code: string;
  quantity: number;
  currency: string;
  price: number;
  type: string;
}
