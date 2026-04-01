import { Image, LinkModel } from '@dcx/ui/libs';

export interface GroupOptionElementData {
  code?: string;
  /**
   * Title of the option
   */
  title?: string;

  /**
   * Description of the option
   */
  description?: string;

  /**
   * Url to redirect of the option
   */
  link?: LinkModel;

  /**
   * Image of the option
   */
  image?: Image;

  /**
   * Button text
   */
  buttonText?: string;

  /**
   * When true, the image is rendered edge-to-edge, filling the left side
   * or the top area of the card without internal padding or inset spacing.
   */
  imageEdgeAligned?: boolean;
  /**
   * Whether the option is disabled
   */
  isDisabled?: boolean;
  /**
   * Custom inline styles applied to the inner wrapper element.
   * Intended for punctual CMS-driven overrides (e.g. background image).
   */
  customStyles?: Record<string, string>;

  /**
   * Whether the option emits an event when clicked
   */
  emitsEvent?: boolean;
}
