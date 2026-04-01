import { TransportType } from '../enums/transport-type.enum';

import { Carrier } from './carrier.dto';

export interface PricingTransport {
  carrier: Carrier;
  type: TransportType;
  name: string;
  model: string;
  manufacturer: string;
  number: string;
}
