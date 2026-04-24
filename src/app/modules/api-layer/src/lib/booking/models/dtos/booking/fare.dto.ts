import { Charge, FareItem } from '../../..';

export interface Fare {
  id: string;
  referenceId: string;
  fareBasisCode: string;
  classOfService: string;
  productClass: string;
  availableSeats: number;
  paxCode: string;
  promoCode: string;
  corporateCode: string;
  serviceBundleCode: string;
  totalAmount: number;
  charges: Charge[];
  cabin: string;
  recommended: boolean;
  name: string;
  items: FareItem[];
  availableSegments: string[];
  substituteCabin: string;
}
