import { SectionColors } from '@dcx/ui/libs';

import { BannerItemContentConfig } from './banner-item-content.config.model';
import { BannerItemFeatureConfig } from './banner-item-feature.config.model';
import { BannerItemLayoutConfig } from './banner-item-layout.config.model';
import { BannerMediaConfig } from './banner-media.config.model';

export interface BannerItemConfig {
  configuration: BannerItemFeatureConfig;
  content: BannerItemContentConfig;
  media: BannerMediaConfig;
  layout: BannerItemLayoutConfig;
  tags?: string[];
  sectionColors?: SectionColors;
}
