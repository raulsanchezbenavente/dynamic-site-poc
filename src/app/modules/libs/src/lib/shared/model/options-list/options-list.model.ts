import { AccessibilityConfig } from '../accessibility/accessibility-config.model';
import { AriaAttributes } from '../accessibility/aria-attributes.model';
import { IconConfig } from '../icon';
import { Image } from '../image';
import { LinkModel } from '../link.model';

export type OptionsListMode = 'selection' | 'menu';
export interface OptionsListConfig {
  options: OptionsList[];
  /**
   * Defines the interaction mode of the options list:
   * - 'selection': acts as a selectable listbox (e.g. for filters, dropdowns).
   * - 'menu': acts as a navigational menu (e.g. sidebar or action list).
   * Default is 'selection' if not specified.
   */
  mode?: OptionsListMode;
  accessibilityConfig?: AccessibilityConfig;
  ariaAttributes?: AriaAttributes;
}

export interface OptionsList {
  id?: string;
  code: string;
  name: string;
  order?: number; // used only in preferred country strategy
  description?: string;
  link?: LinkModel;
  image?: Image;
  icon?: IconConfig;
  lang?: string;
  isDefault?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  ariaAttributes?: AriaAttributes;
}
