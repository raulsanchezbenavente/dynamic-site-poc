import { AriaAttributes } from '../accessibility/aria-attributes.model';

export interface IconConfig {
  /**
   * Icon name (without prefix icon-)
   */
  name: string;
  /**
   * Uses ariaLabel property
   */
  ariaAttributes?: AriaAttributes;
}
