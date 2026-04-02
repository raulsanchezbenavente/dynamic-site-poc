import { EnumVerticalAlign, HorizontalAlign, LayoutSize } from '@dcx/ui/libs';

import { BannerItemStyle } from '../enums';

export interface BannerItemLayoutConfig {
  bannerStyle: BannerItemStyle;
  horizontalAlign: HorizontalAlign;
  verticalAlign?: EnumVerticalAlign;
  fontSize: LayoutSize;
}
