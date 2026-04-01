import { Transport } from '../transport.model';

export interface LegVM {
  origin: string;
  destination: string;
  duration: string;

  std: Date;
  stdutc: Date;
  sta: Date;
  stautc: Date;

  etd?: Date;
  etdutc?: Date;
  eta?: Date;
  etautc?: Date;

  transport: Transport;
}
