import { ApiResponse } from '@dcx/ui/libs';

export interface FindBookingsResponseData {
  segments: BookingSegment[];
}

export type FindBookingsResponse = ApiResponse<FindBookingsResponseData>;
export interface BookingSegment {
  recordLocator: string;
  bookingStatus: number;
  segmentStatus: FlightStatus;
  selectedFare: string;
  departureRealDate: string;
  arrivalRealDate: string;
  durationReal: string;
  duration: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  carrierCode: string;
  marketingCarrierCode: string;
  transportNumber: string;
  transport: string;
  originTerminal: string;
  destinationTerminal: string;
  operationDestinationTerminal: string;
  operationOriginIata: string;
  operationDestinationIata: string;
}
export enum FlightStatus {
  Confirmed,
  Delayed,
  Canceled,
  Closed,
  Returned,
  Diverted,
  Landed,
  Departed,
  Default,
}
export interface AddBookingRequestDto {
  pnr: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  loyaltyNumber: string;
  existsPnr: boolean;
  lastNameSession: string;
}
export interface AddBookingDto {
  pnr: string;
  surname: string;
}
