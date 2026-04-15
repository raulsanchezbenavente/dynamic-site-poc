import { DialogModalsRepositoryModel } from '@dcx/ui/libs';

import { AircraftModel } from './aircraft.model';
import { CarrierItemModel } from './carrier-item-model';

export interface FindBookingsConfig {
  mmbUrl: string;
  checkinUrl: string;
  earlyCheckinEligibleStationCodes: string[];
  dialogModalsRepository: DialogModalsRepositoryModel;
  carriersList: CarrierItemModel[];
  airCraftList: AircraftModel[];
}
