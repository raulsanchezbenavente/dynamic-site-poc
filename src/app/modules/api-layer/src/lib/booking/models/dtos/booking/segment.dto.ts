import { Leg, Transport } from '../../..';

export interface Segment {
  id: string;
  referenceId: string;
  origin: string;
  destination: string;
  originCountry: string;
  destinationCountry: string;
  std: Date;
  stdutc: Date;
  sta: Date;
  stautc: Date;
  duration: string; // TimeSpan is represented as a string
  departureGate: string;
  legs: Leg[];
  transport: Transport;
}
