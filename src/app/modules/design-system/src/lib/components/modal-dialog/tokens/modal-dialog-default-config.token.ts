import { InjectionToken } from '@angular/core';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';

import { ModalDialogSize } from '../enums/modal-dialog-size.enum';
import { ModalDialogConfig } from '../models/modal-dialog.config';

export const MODAL_DIALOG_CONFIG = new InjectionToken<ModalDialogConfig>('MODAL_DIALOG_CONFIG');

export const DEFAULT_CONFIG_MODAL_DIALOG: ModalDialogConfig = {
  title: 'Default Modal Title config',
  introText: '',
  layoutConfig: {
    size: ModalDialogSize.SMALL,
  },
  footerButtonsConfig: {
    isVisible: true,
    actionButton: {
      label: 'See more services',
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.ACTION,
      },
    },
    secondaryButton: {
      label: 'Exit',
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.LINK,
      },
    },
  },
  programmaticOpen: false,
};
