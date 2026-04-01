import { SliderBreakpointsConfig } from '@dcx/ui/libs';

import { TabConfig } from './tab.config';

export interface TabsConfig {
  autoSelectOnFocus?: boolean;
  breakPointConfig?: SliderBreakpointsConfig;
  items: TabConfig[];
}
