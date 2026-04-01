import { DsNgbTriggerEvent } from '../../enums';

export interface TooltipConfig {
  /**
   * Controls the visibility of the tooltip in DOM (shown or hidden).
   */
  isVisible?: boolean;
  /**
   * Text for the trigger element, required for accessibility.
   * Even if the trigger is not visually visible (e.g., when using the `infoIcon` style),
   * this text must always provide additional context for screen readers.
   */
  triggerText: string;
  text: string;
  /**
   * If `true`, the `triggerText` is visually hidden and used only for accessibility purposes.
   * This is typically applied when the tooltip is triggered by an icon or another non-text component.
   */
  hiddenTriggerText?: boolean;
  /**
   * Define trigger event such as: click, hover, etc
   */
  triggerEvent?: DsNgbTriggerEvent;
  /**
   * The preferred placement of the tooltip, among the possible values.
   * The default order of preference is "auto".
   */
  placement?: string;
  /**
   * A selector specifying the element the tooltip should be appended to.
   * Currently only supports "body".
   */
  container?: string;
  /**
   * Indicates whether the tooltip is visually disabled, while still being visible.
   */
  isDisabled?: boolean;
  /**
   * Determines if the tooltip is triggered only when interacting with an information icon.
   * Set to `true` to enable this behavior.
   */
  iconOnly?: boolean;
  /**
   * Add additional CSS classes to customize the appearance of the component.
   */
  styleClass?: string;
}
