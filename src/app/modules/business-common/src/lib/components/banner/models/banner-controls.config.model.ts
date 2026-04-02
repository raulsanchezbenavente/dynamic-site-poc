import { AccessibilityConfig, AriaAttributes } from '@dcx/ui/libs';

import { BannerItemConfig } from './banner-item.config.model';

export interface BannerControlsConfig {
  showControls: boolean;
  ariaAttributes?: AriaAttributes;
  accessibilityConfig: AccessibilityConfig;
  showPagination: boolean;
  items: BannerItemConfig[];
}
