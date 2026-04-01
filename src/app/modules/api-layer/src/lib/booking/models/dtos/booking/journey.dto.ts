import { JourneyStatus } from '@dcx/ui/libs';

import { DisruptionItem, Fare, Segment } from '../../..';

export interface Journey {
  origin: string;
  originTerminal: string;
  originCountry: string;
  destination: string;
  destinationTerminal: string;
  destinationCountry: string;
  std: Date;
  stdutc: Date;
  sta: Date;
  stautc: Date;
  duration: string; // TimeSpan is represented as a string
  referenceId: string;
  segments: Segment[];
  fares: Fare[];
  status: JourneyStatus;
  hasDisruptions: boolean;
  disruptionItems: DisruptionItem[];
  openingCheckInDate: Date;
  closingCheckInDate: Date;
  id: string;
}
