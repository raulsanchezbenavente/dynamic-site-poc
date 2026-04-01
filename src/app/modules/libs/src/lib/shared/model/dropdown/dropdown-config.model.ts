import { AccessibilityConfig, AriaAttributes, DropdownLayoutConfig, IconConfig } from '../../model';

export interface DropdownConfig {
  label: string;
  icon?: IconConfig;
  closeOnSelection?: boolean;
  isDisabled?: boolean;
  layoutConfig: DropdownLayoutConfig;
  accessibilityConfig?: AccessibilityConfig;
  ariaAttributes?: AriaAttributes;
}
