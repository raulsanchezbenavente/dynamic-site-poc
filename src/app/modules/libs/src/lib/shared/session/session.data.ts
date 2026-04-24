import { IbeEventTypeEnum } from '../../core';
import { AccountData, SegmentWithSelectedPassengers } from '../api-models';
import { urlHelpers } from '../helpers';
import {
  AccountProfileStatus,
  Booking,
  BookingCurrency,
  BookingFee,
  IbeFlow,
  SearchedJourney,
  SeatMapVM,
} from '../model';

export const CLEAN_BOOKING: Booking = {
  journeys: [],
  bookingInfo: {
    comments: [],
    createdDate: '',
    pointOfSale: {
      agent: { id: '' },
      organization: { id: '' },
    },
    queues: [],
    recordLocator: '',
    status: '',
  },
  pricing: {
    balanceDue: 0,
    breakdown: {
      perBooking: [],
      perPax: [],
      perPaxJourney: [],
      perPaxSegment: [],
      perSegment: [],
    },
    currency: '',
    isBalanced: false,
    totalAmount: 0,
  },
  contacts: [],
  bookingFees: [],
  pax: [],
  payments: [],
  services: [],
};

export const CLEAN_SESSION_DATA: SessionData = {
  session: {
    booking: CLEAN_BOOKING,
    culture: urlHelpers.getCultureFromCurrentUrl(),
    selectedPassengers: [],
    originalBooking: CLEAN_BOOKING,
  },
};

/**
 * clean account profile status
 */
export const CLEAN_PROFILE_STATUS: AccountProfileStatus = {
  accountPassengerSelected: [],
  accountPassengerList: [],
};

/**
 * Session Data to save in storage
 */
export class SessionData {
  public userAgentResponse?: AccountData;
  public session!: SessionDataVM;
}

export interface SessionDataVM {
  booking: Booking;
  paymentData?: any;
  appliedPayments?: string[];
  culture: string;
  discountData?: any;
  seatMapList?: SeatMapVM[];
  summaryEvent?: IbeEventTypeEnum;
  selectedPassengers?: SegmentWithSelectedPassengers[];
  bookingCurrencies?: BookingCurrency[];
  showDeclined?: boolean;
  selectedCurrency?: string;
  flow?: IbeFlow;
  /**
   * Searched Journeys, used to update search resume
   */
  searchedJourneys?: SearchedJourney[];
  bookingFee?: BookingFee;
  originalBooking: Booking;
  accountProfileStatus?: AccountProfileStatus;
}
