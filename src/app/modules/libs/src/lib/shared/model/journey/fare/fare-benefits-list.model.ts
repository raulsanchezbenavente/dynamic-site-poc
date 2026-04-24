import { AriaAttributes } from '../../accessibility/aria-attributes.model';

import { FareBenefitsListItem } from './fare-benefits-list-item.model';

/**
 * MOdelo para pintar
 */
export interface FareBenefitsList {
  items: FareBenefitsListItem[];
  ariaAttributes?: AriaAttributes;
}
