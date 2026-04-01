import { HorizontalAlign, ModalDialogActionType } from '../../enums';
import { AriaAttributes } from '../accessibility/aria-attributes.model';
import { IconConfig } from '../icon';
import { LinkModel } from '../link.model';

import { ButtonLayout } from './button-layout.model';

export interface ButtonConfig {
  ariaAttributes?: AriaAttributes;
  icon?: ButtonIconConfig;
  isDisabled?: boolean;
  isLoading?: boolean;
  label: string;
  type?: 'button' | 'submit' | 'reset';
  actionPrimary?: ModalDialogActionType;
  actionSecondary?: ModalDialogActionType;
  loadingLabel?: string;
  layout?: ButtonLayout;
  link?: LinkModel;
  /** Override the rendered HTML element. Defaults to 'a' when link is set, otherwise 'button'. */
  renderAs?: 'button' | 'a' | 'div';
}

export interface ButtonIconConfig extends IconConfig {
  position?: HorizontalAlign;
}
