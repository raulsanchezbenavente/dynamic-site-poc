import { PaxTypeCode } from '../enums/pax-type-code.enum';

import { Channel } from './../model/channel';
import { Document } from './../model/document';
import { PaxAncillaries } from './../model/pax-ancillaries';
import { LoyaltyNumber } from './loyalty/loyalty-number.model';

export interface Passenger {
  type: {
    category?: string;
    code: PaxTypeCode;
  };
  dependentPaxes?: string[];
  id: string;
  name: {
    title?: string;
    first: string;
    middle?: string;
    last?: string;
  };
  address?: {
    country: string;
    province?: string;
    city?: string;
    zipCode?: string;
    addressLine: string;
  };
  documents?: Document[];
  personInfo?: {
    gender?: string;
    weight?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  channels?: Channel[];
  segmentsInfo?: PaxSegmentsInfo[];
  status?: string;
  referenceId?: string;

  /* Added */
  paxAncillaries?: PaxAncillaries[];
  liftStatus?: string;
  infantId?: string;
  isAvailable?: boolean;
  loyaltyNumbers?: LoyaltyNumber[];
}

export interface PaxSegmentsInfo {
  segmentId: string;
  status: string;
  seat: string;
  extraSeats?: string[];

  /**
   * AV properties
   */
  boardingSequence?: string; // TODO: string?
  boardingZone?: string; // TODO: string?
}
