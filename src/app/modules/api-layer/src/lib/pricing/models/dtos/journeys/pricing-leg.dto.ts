import { LegInfo } from './leg-info.dto';

export interface PricingLeg {
  origin: string;
  destination: string;
  originTerminal: string;
  destinationTerminal: string;
  originCountry: string;
  destinationCountry: string;
  std: Date;
  stdUtc: Date;
  sta: Date;
  staUtc: Date;
  duration: string; // Timespan
  legInfo: LegInfo;
  referenceId: string;
}
