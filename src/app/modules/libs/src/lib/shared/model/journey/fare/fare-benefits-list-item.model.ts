import { FareItemApplicability } from '../../../enums/journey/fare-item-applicability.enum';
import { IconConfig } from '../../icon/icon-config';

export interface FareBenefitsListItem {
  content: string;
  icon?: IconConfig;
  applicability?: FareItemApplicability;
}
