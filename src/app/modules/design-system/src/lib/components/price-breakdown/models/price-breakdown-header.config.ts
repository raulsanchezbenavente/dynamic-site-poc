import { AriaAttributes } from '@dcx/ui/libs';

export interface PriceBreakdownHeaderVM {
  config: PriceBreakdownHeaderConfig;
  isCollapsed?: boolean;
  isExpanded?: boolean; // this is dev level only
}
export interface PriceBreakdownHeaderConfig {
  label?: string;
  secondLabel?: string;
  price?: number;
  currency?: string;
  isCollapsible?: boolean;
  ariaAttributes: AriaAttributes;
}
