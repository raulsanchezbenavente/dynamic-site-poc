import { ToastStatus } from '../enums/toast-status.enum';

export interface Toast {
  message: string;
  status: ToastStatus;
  delay?: number;
  autohide?: boolean;
  cssClass?: string;

  /**
   * Distance in pixels from the viewport top (or header bottom) when sticky mode activates.
   * This value is added to --header-height if a header exists.
   * @default 32
   */
  stickyViewportOffset?: number;
}
