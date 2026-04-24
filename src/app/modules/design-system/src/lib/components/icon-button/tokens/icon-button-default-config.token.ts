import { InjectionToken } from '@angular/core';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';

import { IconButtonConfig } from '../models/icon-button.model';

export const ICON_BUTTON_CONFIG = new InjectionToken<IconButtonConfig>('ICON_BUTTON_CONFIG');

export const DEFAULT_CONFIG_ICON_BUTTON: IconButtonConfig = {
  isDisabled: false,
  icon: {
    name: 'cross',
  },
  layout: {
    size: LayoutSize.SMALL,
    style: ButtonStyles.ACTION,
  },
};
