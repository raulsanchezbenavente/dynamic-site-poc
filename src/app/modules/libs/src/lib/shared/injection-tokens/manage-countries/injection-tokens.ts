import { InjectionToken } from '@angular/core';

import { IManageCountriesStrategy } from '../../interfaces';

export const MANAGE_COUNTRIES_STRATEGY = new InjectionToken<IManageCountriesStrategy>('manage-countries-strategy');
