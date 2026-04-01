import { Carrier, TransportType } from '@dcx/ui/api-layer';

export interface Transport {
  type?: TransportType;
  carrier: Carrier;
  number: string;
  model?: string;
}
