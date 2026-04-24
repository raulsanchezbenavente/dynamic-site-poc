import { AriaAttributes, ButtonLayout, IconConfig } from '@dcx/ui/libs';
export interface IconButtonConfig {
  ariaAttributes?: AriaAttributes;
  icon: IconConfig;
  isDisabled?: boolean;
  layout?: ButtonLayout;
}
