import { RegulatoryPaxDetailsCategory } from '@dcx/ui/libs';

export interface PaxRegulatoryDetailsVM {
  paxId: string;
  statusCleared: boolean;
  missingDetails: RegulatoryPaxMissingDetails[];
}

export interface RegulatoryPaxMissingDetails {
  category: RegulatoryPaxDetailsCategory;
  missingDetails: RegulatoryPaxMissingDetailItem[];
  isCompleted: boolean;
}

export interface RegulatoryPaxMissingDetailItem {
  canBeDeclined: boolean;
  detailsType: string;
  regulatoryType: string;
  requiredDetailsFields: string[];
  isOptional: boolean;
}

export { RegulatoryPaxDetailsCategory } from '@dcx/ui/libs';
