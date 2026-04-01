import { LoyaltyNumber, PaxSegmentInfo, PaxStatus, PaxTypeInfo, Person } from '../../..';

export interface Pax extends Person {
  type: PaxTypeInfo;
  dependentPaxes: string[];
  loyaltyNumbers?: LoyaltyNumber[];
  segmentsInfo?: PaxSegmentInfo[];
  referenceId: string;
  customerId: string;
  status: PaxStatus;
  purposeOfVisit: string;
  id: string;
}
