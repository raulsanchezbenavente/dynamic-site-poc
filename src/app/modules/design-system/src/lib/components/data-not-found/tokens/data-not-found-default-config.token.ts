import { InjectionToken } from '@angular/core';

import { DataNotFoundConfig } from '../models/data-not-found-config.model';

export const DATA_NOT_FOUND_CONFIG = new InjectionToken<DataNotFoundConfig>('DATA_NOT_FOUND_CONFIG');

export const DEFAULT_CONFIG_DATA_NOT_FOUND: DataNotFoundConfig = {
  text: 'Set data not found text',
  icon: {
    name: 'icon-cross-circle-outline',
  },
};
