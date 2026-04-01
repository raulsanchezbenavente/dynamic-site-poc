import { InjectionToken } from '@angular/core';

import { IBannerImageBreakpointsConfig } from '../../interfaces/banners/banner-image-breakpoints.config.interface';

export const BANNER_BREAKPOINT_CONFIG = new InjectionToken<IBannerImageBreakpointsConfig>('banner.config');

export const BANNER_DEFAULT_CONFIG: IBannerImageBreakpointsConfig = {
  layout: {
    sizeUnit: 'px',
    breakpoints: {
      mediumSize: 640,
      largeSize: 992,
    },
  },
};
