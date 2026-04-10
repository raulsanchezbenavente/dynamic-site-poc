import { BannerConfigParams } from '@dcx/ui/business-common';
import { IconConfig, LinkModel, SectionColors } from '@dcx/ui/libs';

import { MainMenuColumn } from './main-menu-column.model';

export interface MainMenuItem {
  id?: string;
  title: string;
  icon?: IconConfig;
  link?: LinkModel;
  tag?: string;
  columns: MainMenuColumn[];
  sectionColor?: SectionColors;
  bannerConfig?: BannerConfigParams;
}
