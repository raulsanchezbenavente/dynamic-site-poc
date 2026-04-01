import { EnumServiceType } from '@dcx/ui/libs';

export interface AddServiceCommand {
  serviceSellKey: string;
  code: string;
  type: EnumServiceType;
  paxId: string;
  sellKey: string;
}
