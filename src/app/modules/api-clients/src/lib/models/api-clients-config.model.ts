import { EndpointsConfiguration } from '@dcx/ui/libs';

export interface ApiClientsConfig {
  apiBaseUrl?: string | (() => string);
  endpointsConfig?: EndpointsConfiguration | (() => EndpointsConfiguration);
}
