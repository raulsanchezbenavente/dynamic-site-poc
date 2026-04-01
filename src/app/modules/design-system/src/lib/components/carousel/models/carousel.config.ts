import { AriaAttributes, SliderBreakpointsConfig } from '@dcx/ui/libs';

export interface CarouselConfig {
  breakPointConfig?: SliderBreakpointsConfig;
  ariaAttributes?: AriaAttributes;
  next?: {
    ariaAttributes?: AriaAttributes;
  };
  prev?: {
    ariaAttributes?: AriaAttributes;
  };
}
