import { DsNgbTriggerEvent } from '@dcx/ui/libs';

import { PopoverHeaderConfig } from './popover-header.config';

/**
 * This component uses features from ng-bootstrap.
 * See: https://ng-bootstrap.github.io/releases/18.x/#/home for reference and usage guidelines.
 */

export interface PopoverConfig {
  popoverHeaderConfig: PopoverHeaderConfig;
  /**
   * The preferred placement of the popover, among the [possible values](#/guides/positioning#api).
   * 'start' | 'end' | 'top' | 'bottom' | 'auto' and combinations.
   * The default order of preference is `"auto"`.
   */
  placement?: string;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports `body`.
   */
  container?: string | null;
  /**
   * Specifies events that should trigger the tooltip.
   * Supports a space separated list of event names.
   */
  triggers?: DsNgbTriggerEvent | string;
  /**
   * Displays an icon as the popover trigger button.
   * If sets `true`, uses the `triggerAriaLabel` for accessibility when the trigger has no text content.
   */
  iconTrigger?: boolean;
  /**
   * Provides an accessible label for the trigger button when it does not have textual information.
   * This is especially important when `iconTrigger` is `true` and the trigger is just an icon.
   */
  triggerAriaLabel?: string;
  openDelay?: number;
  closeDelay?: number;
  autoClose?: boolean | 'inside' | 'outside';
  customClass?: string;
  /**
   * Popper.js offset as [skidding, distance] in pixels.
   * Skidding displaces the popover along the reference element.
   * Distance displaces the popover away from the reference element.
   */
  offset?: [number, number];
  /**
   * If true, in small devices, content slides from bottom
   */
  responsiveOffCanvas?: boolean;
}
