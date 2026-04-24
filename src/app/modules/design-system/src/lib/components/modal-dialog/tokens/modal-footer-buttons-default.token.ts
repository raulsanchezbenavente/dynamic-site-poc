import { InjectionToken } from '@angular/core';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';

import { ModalFooterButtonsConfig } from '../models/modal-footer-buttons.config';

export const MODAL_FOOTER_BUTTONS_CONFIG = new InjectionToken<ModalFooterButtonsConfig>('MODAL_FOOTER_BUTTONS_CONFIG');

export const DEFAULT_CONFIG_MODAL_FOOTER_BUTTONS: ModalFooterButtonsConfig = {
  actionButton: {
    label: '',
    layout: {
      size: LayoutSize.MEDIUM,
      style: ButtonStyles.ACTION,
    },
  },
};
