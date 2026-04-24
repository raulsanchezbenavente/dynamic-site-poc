import { LinkModel } from '@dcx/ui/libs';

export interface OffCanvasConfig {
  /**
   * Configures header. A title is mandatory for accessibility (A11Y) purposes.
   */
  offCanvasHeaderConfig: OffCanvasHeaderConfig;
  /**
   * If `true`, opening and closing will be animated.
   */
  animation?: boolean;
  /**
   * `aria-describedby` attribute value to set on the offcanvas panel.
   */
  ariaDescribedBy?: string;
  /**
   * `aria-labelledby` attribute value to set on the offcanvas panel.
   */
  ariaLabelledBy?: string;
  /**
   * The position of the offcanvas
   */
  position?: 'start' | 'end' | 'top' | 'bottom';
  /**
   * Scroll content while offcanvas is open (false by default).
   */
  scroll?: boolean;
  /**
   * A custom class to append to the offcanvas backdrop.
   */
  backdropClass?: string;
  /**
   * A custom class to append to the offcanvas panel.
   */
  panelClass?: string;
  showCloseButton?: boolean;
}

export interface OffCanvasHeaderConfig {
  /**
   * A title is mandatory on modals components for accessibility (A11Y) purposes.
   * If an image is set, the title is used as the image's alt attribute.
   */
  title: string;
  subtitle?: string;
  /**
   * Set an image as title.
   * If an image is set, the title is used as the image's alt attribute.
   */
  imageSrc?: string;
  /**
   * When set together with `imageSrc`, the image is wrapped in a link (ex. navigate to home).
   */
  imageLink?: LinkModel;
}
