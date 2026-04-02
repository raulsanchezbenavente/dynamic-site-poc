import { DateDisplayConfig } from '@dcx/ui/design-system';

export interface BoardingPassSegmentVM {
  id: string;
  journeyId: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  departureDate: DateDisplayConfig;
  gate: string;
  seat: string;
  flightNumber: string;
}
