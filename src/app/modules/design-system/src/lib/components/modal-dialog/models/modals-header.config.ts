/**
 * Configuration model used by various modal components including modal dialogs, popovers, and off-canvas elements.
 *
 * This model ensures that essential attributes such as titles for accessibility (A11Y) are consistently provided
 * across different types of modal components.
 * Optional attributes like subtitles and image sources allow for flexible and rich content display.
 */
export interface ModalsHeaderConfig {
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
}
