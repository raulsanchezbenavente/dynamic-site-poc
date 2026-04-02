import { PopoverConfig } from '@dcx/ui/design-system';

import { CarriersDisplayMode } from '../enums/carriers-display-mode.enum';

export interface ScheduleConfig {
  carriersDisplayMode: CarriersDisplayMode;
  showTotalDuration?: boolean;
  legsDetailsPopoverConfig?: Partial<PopoverConfig>;
}
