import { TransportType } from '@dcx/ui/libs';

export interface SegmentStatusTransportDto {
  carrierName: string;
  number: string;
  type: TransportType;
}
