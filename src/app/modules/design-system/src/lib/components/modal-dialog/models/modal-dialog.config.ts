import { AriaAttributes, IconConfig } from '@dcx/ui/libs';

import { AlertPanelConfig } from '../../alert-panel';

import { ModalFooterButtonsConfig } from './modal-footer-buttons.config';
import { ModalLayoutConfig } from './modal-layout.config';

export interface ModalDialogConfig {
  /**
   * Title is obligatory on modals
   */
  title: string;
  /**
   * If modal uses an image as title, the title property will be used as img alt property
   */
  titleImageSrc?: string;
  subtitle?: string;
  introText?: string;
  alertPanelConfig?: AlertPanelConfig;
  icon?: IconConfig;
  footerButtonsConfig?: ModalFooterButtonsConfig;
  layoutConfig?: ModalLayoutConfig;
  ariaAttributes?: AriaAttributes;
  programmaticOpen?: boolean;
}
