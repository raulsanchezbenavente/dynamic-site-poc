import { provideHttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { API_BASE_URL as ACCOUNT_API_BASE_URL, AccountClient } from './account-api';
import { API_BASE_URL as ACCOUNTV2_API_BASE_URL, AccountV2Client } from './accountV2-api';
import { API_BASE_URL as BOOKING_API_BASE_URL, BookingClient } from './booking-api';
import { API_BASE_URL as CMS_CONFIG_API_BASE_URL, CmsConfigClient } from './cmsConfig-api';
import { API_CLIENT_PREFIXES } from './constants/api-client-prefixes.const';
import { API_BASE_URL as CONTACTS_API_BASE_URL, ContactsClient } from './contacts-api';
import { API_BASE_URL as LOCATION_API_BASE_URL, LocationClient } from './location-api';
import { ApiClientsConfig } from './models/api-clients-config.model';
import { API_BASE_URL as PRICING_API_BASE_URL, PricingClient } from './pricing-api';
import { API_BASE_URL as RESOURCES_API_BASE_URL, ResourcesClient } from './resources-api';
import { API_BASE_URL as SEGMENTS_STATUS_API_BASE_URL, SegmentsStatusClient } from './segmentsStatus-api';
import { API_BASE_URL as SERVICES_API_BASE_URL, ServicesClient } from './services-api';
import { createApiProvider } from './utils/api-client-url.utils';

export function provideApiClients(config: ApiClientsConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    createApiProvider(ACCOUNT_API_BASE_URL, config, API_CLIENT_PREFIXES.ACCOUNT),
    createApiProvider(ACCOUNTV2_API_BASE_URL, config, API_CLIENT_PREFIXES.ACCOUNTV2),
    createApiProvider(BOOKING_API_BASE_URL, config, API_CLIENT_PREFIXES.BOOKING),
    createApiProvider(CONTACTS_API_BASE_URL, config, API_CLIENT_PREFIXES.CONTACTS),
    createApiProvider(LOCATION_API_BASE_URL, config, API_CLIENT_PREFIXES.LOCATION),
    createApiProvider(RESOURCES_API_BASE_URL, config, API_CLIENT_PREFIXES.RESOURCES),
    createApiProvider(SEGMENTS_STATUS_API_BASE_URL, config, API_CLIENT_PREFIXES.SEGMENTS_STATUS),
    createApiProvider(PRICING_API_BASE_URL, config, API_CLIENT_PREFIXES.PRICING),
    createApiProvider(SERVICES_API_BASE_URL, config, API_CLIENT_PREFIXES.SERVICES),
    createApiProvider(CMS_CONFIG_API_BASE_URL, config, API_CLIENT_PREFIXES.CMS_CONFIG, true),
    AccountClient,
    AccountV2Client,
    BookingClient,
    ContactsClient,
    LocationClient,
    ResourcesClient,
    SegmentsStatusClient,
    ServicesClient,
    PricingClient,
    CmsConfigClient,
  ]);
}
