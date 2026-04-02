import { AccessibilityConfig, AriaAttributes } from '@dcx/ui/libs';

import { BannerAnimationEffect } from '../enums';

import { BannerItemConfig } from './banner-item.config.model';

export interface BannerConfigParams {
  bannerTitle?: string;
  bannerItems: BannerItemConfig[];
  animationEffect: BannerAnimationEffect;
  animationCycleTime: number;
  /**
   * Swap functionality is not implemented yet.
   * This feature is currently not available and should not be used.
   */
  isTouchSwipe: boolean;
  isFullWidth: boolean;
  showControls: boolean;
  showPagination: boolean;
  rootNodeId: number;
  accessibilityConfig: AccessibilityConfig;
  ariaAttributes: AriaAttributes;
  culture: string;
}
