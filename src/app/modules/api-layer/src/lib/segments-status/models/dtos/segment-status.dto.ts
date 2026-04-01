import { SegmentStatus } from './enums/segment-status.enum';
import { SegmentStatusTransportDto } from './segment-status-transport.dto';

export interface SegmentStatusDto {
  delayDeparture: Date;
  ata: Date;
  atd: Date;
  atautc: Date;
  atdutc: Date;
  std: Date;
  etd: Date;
  stdutc: Date;
  etdutc: Date;
  sta: Date;
  eta: Date;
  stautc: Date;
  etautc: Date;
  duration: string;
  origin: string;
  destination: string;
  transport: SegmentStatusTransportDto;
  status: SegmentStatus;
}
