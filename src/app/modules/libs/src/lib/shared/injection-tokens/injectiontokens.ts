import { InjectionToken } from '@angular/core';

import { IResourcesRetrieve, ISummarySelectedJourneysService } from '../interfaces';
import { BusinessConfig, DictionaryType, I18NValues } from '../model';

export const BUSINESS_CONFIG = new InjectionToken<BusinessConfig>('businessConfig');
export const PRODUCTION = new InjectionToken<number>('production');
export const LOGIN_REDIRECT = new InjectionToken<string>('loginRedirect');
export const TIMEOUT_REDIRECT = new InjectionToken<string>('timeOutRedirect');
export const EXCLUDE_SESSION_EXPIRED_URLS = new InjectionToken<string[]>('excludedSessionExpiredUrls');
export const STORED_PAYMENTS_SORT_SERVICE = new InjectionToken<DictionaryType>('storedPaymentsSortService');
export const I18N_VALUE = new InjectionToken<I18NValues>('i18n_values');

export const RESOURCES_RETRIEVE_SERVICE = new InjectionToken<IResourcesRetrieve>('resourcesRetrieveService');

export const SUMMARY_SELECTED_JOURNEYS_SERVICE = new InjectionToken<ISummarySelectedJourneysService>(
  'SummarySelectedJourneysService'
);
