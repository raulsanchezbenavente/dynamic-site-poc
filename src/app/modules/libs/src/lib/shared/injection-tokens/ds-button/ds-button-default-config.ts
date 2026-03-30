import { InjectionToken } from '@angular/core';

import { ButtonStyles, LayoutSize } from '../../enums';
import { ButtonConfig } from '../../model/button/button-config.model';

export const BUTTON_CONFIG = new InjectionToken<ButtonConfig>('BUTTON_CONFIG');

export const DEFAULT_CONFIG_BUTTON: ButtonConfig = {
  label: '',
  type: 'button',
  layout: {
    size: LayoutSize.MEDIUM,
    style: ButtonStyles.PRIMARY,
  },
};
