import { Charge } from '../../charge';

import { FareBenefitsList } from './fare-benefits-list.model';

export interface Fare {
  id: string;
  referenceId: string;
  /**
   * Fare basis code used to define pricing and fare rules.
   * Typically includes booking class and fare restrictions (e.g. 'Y26NR', 'MEX14').
   * Used in reservation systems to validate and issue fares.
   */
  fareBasisCode: string;
  /**
   * Booking class code (e.g. 'Y', 'M', 'C') that indicates:
   * - The type of seat or service purchased
   * - Applicable fare rules and restrictions
   * - Upgrade priority and mileage accrual eligibility
   */
  classOfService: string;
  /**
   * ProductClass - Identifies the fare type.
   * Retrieves configuration from CMS, primarily used for translation dictionary keys.
   */
  productClass: string;
  serviceBundleCode: string;
  availableSeats: number;
  benefitsList?: FareBenefitsList;
  charges: Charge[];
  totalAmount?: number;

  // UI-only properties (not part of backend data)
  /**
   * Visual order of fare level, used to determine UI styles (e.g. fare1, fare2, etc.)
   */
  order?: number;
  /**
   * Marks this fare as currently selected in the UI.
   */
  isSelected?: boolean;
  /**
   * Highlights this fare as recommended in the UI.
   */
  isRecommended?: boolean;
}
