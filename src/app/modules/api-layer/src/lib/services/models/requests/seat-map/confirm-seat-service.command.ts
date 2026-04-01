import { EnumServiceType } from '@dcx/ui/libs';

export interface ConfirmSeatServiceCommand {
  serviceSellKey: string;
  code: string;
  type: EnumServiceType;
  paxId: string;
  sellKey: string;
  seat: string;
  compartmentDesignator: string;
  serviceId: string;
}
