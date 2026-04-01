import { TransportType } from '../../enums/transport-type.enum';

import { Carrier } from './carrier.model';

export interface Transport {
  type?: TransportType;
  carrier: Carrier;
  number: string;
  model?: string;
  manufacturer?: string;
}
