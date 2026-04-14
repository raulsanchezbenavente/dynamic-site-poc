import { PatchedResourcesClient } from '@dcx/module/api-clients';
import { DEFAULT_CONFIG_FORM_SUMMARY_BUTTONS, FORM_SUMMARY_CONFIG } from '@dcx/ui/business-common';
import {
  BUTTON_CONFIG,
  DEFAULT_CONFIG_BUTTON,
  MANAGE_COUNTRIES_STRATEGY,
  ManageCountriesService,
  PreferredCountriesByConfigStrategy,
  PreferredCountryByArrivalStationStrategy,
  PreferredCountryByDepartureStationStrategy,
} from '@dcx/ui/libs';
import { COMMON_TRANSLATIONS, ManageCountriesServiceFake } from '@dcx/ui/mock-repository';

export const AP_APP_PROVIDERS = [
  {
    provide: COMMON_TRANSLATIONS,
    useValue: COMMON_TRANSLATIONS,
  },
  {
    provide: MANAGE_COUNTRIES_STRATEGY,
    useClass: PreferredCountriesByConfigStrategy,
    multi: true,
  },
  {
    provide: MANAGE_COUNTRIES_STRATEGY,
    useClass: PreferredCountryByArrivalStationStrategy,
    multi: true,
  },
  {
    provide: MANAGE_COUNTRIES_STRATEGY,
    useClass: PreferredCountryByDepartureStationStrategy,
    multi: true,
  },
  {
    provide: BUTTON_CONFIG,
    useValue: DEFAULT_CONFIG_BUTTON,
  },
  {
    provide: FORM_SUMMARY_CONFIG,
    useValue: DEFAULT_CONFIG_FORM_SUMMARY_BUTTONS,
  },
  {
    provide: ManageCountriesService,
    useClass: ManageCountriesServiceFake,
  },
  PatchedResourcesClient,
];
