import { IconConfig, LinkModel } from '@dcx/ui/libs';

import { MenuType } from '../enums/menu-type.enum';

export interface AuthAccountMenuOptionConfig {
  link: LinkModel;
  icon?: IconConfig;
  isSelected?: boolean;
  type?: MenuType;
  tabId?: string;
}
