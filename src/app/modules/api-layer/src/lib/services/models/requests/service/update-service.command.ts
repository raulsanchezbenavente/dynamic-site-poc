import { EnumServiceType } from '@dcx/ui/libs';

export interface UpdateServiceCommand {
  serviceId: string;
  serviceSellKey: string;
  code: string;
  type: EnumServiceType;
  paxId: string;
  sellKey: string;
}
