export interface PopoverHeaderConfig {
  /**
   * A title is mandatory on popovers component for accessibility (A11Y) purposes.
   * If an image is set, the title is used as the image's alt attribute.
   */
  title: string;
  subtitle?: string;
  /**
   * Set an image as title.
   * If an image is set, the title is used as the image's alt attribute.
   */
  imageSrc?: string;
}
