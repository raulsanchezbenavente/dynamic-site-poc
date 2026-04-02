import { ButtonLayout } from '@dcx/ui/libs';

import { ActionType } from '../enums/action-type.enum';
import { SubmitButtonRedirectType } from '../enums/submit-button-redirect-type.enum';

/**
 * Model related with ActionButton component functionality
 * Allows to set Layout(label), "Submit" actions and "Redirect" actions
 */
export interface ActionButtonData {
  label: string;
  /**
   * RedirectType
   * + Use External for redirect to external urls
   * + Use internal for internal/relative paths
   * + Use None in cases when only Submit functionality is required
   */
  redirectType: SubmitButtonRedirectType;
  /**
   * Required property if a redirect type is specified as internal or external
   */
  redirectUrl: string;
  /**
   * Submit type
   * + Use ALL for submit all registered componenents in current page.
   * + Use LIST for submit only components
   * + Use NONE in cases when only redirect functionality is required.
   */
  submitType: ActionType;
  /**
   * Optional property to support submit functionality for a specified components
   * based on their priority property
   */
  submitOrder?: number[];
  layout?: ButtonLayout;
}
