import { InjectionToken } from '@angular/core';
import { ButtonConfig, ButtonStyles, LayoutSize } from '@dcx/ui/libs';

import { FormSummaryButtonsConfig } from '../models/form-summary-buttons-config.model';

export const FORM_SUMMARY_CONFIG = new InjectionToken<Map<string, ButtonConfig>>('FORM_SUMMARY_CONFIG');

export const DEFAULT_CONFIG_FORM_SUMMARY_BUTTONS: FormSummaryButtonsConfig = {
  saveButton: {
    label: '',
    layout: {
      style: ButtonStyles.PRIMARY,
    },
  },
  cancelButton: {
    label: '',
    layout: {
      style: ButtonStyles.SECONDARY,
    },
  },
  addButton: {
    label: '',
    layout: {
      style: ButtonStyles.LINK,
      size: LayoutSize.SMALL,
    },
    icon: {
      name: 'plus-circle-outline',
    },
  },
  editButton: {
    label: '',
    layout: {
      style: ButtonStyles.LINK,
      size: LayoutSize.SMALL,
    },
    icon: {
      name: 'edit',
    },
  },
};
