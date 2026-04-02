import { InjectionToken, Provider } from '@angular/core';
import { EndpointsConfiguration } from '@dcx/ui/libs';

import { ApiClientsConfig } from '../models/api-clients-config.model';

export function buildApiUrl(baseUrl: string, prefix: string): string {
  if (!baseUrl) return prefix;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return cleanBase + cleanPrefix;
}

export function extractBaseUrlFromEndpoints(endpoints: EndpointsConfiguration, prefix: string): string {
  const cleanPrefix = prefix.startsWith('/') ? prefix.substring(1) : prefix;

  const endpointKey = Object.keys(endpoints).find((key) =>
    key.toLowerCase().includes(`url${cleanPrefix.toLowerCase()}`)
  );

  let targetUrl = '';
  if (endpointKey) {
    targetUrl = endpoints[endpointKey as keyof EndpointsConfiguration];
  }

  if (!targetUrl) {
    targetUrl = Object.values(endpoints).find(
      (value) => typeof value === 'string' && value.startsWith('http')
    ) as string;
  }

  return extractBaseUrl(targetUrl || '');
}

export function extractBaseUrl(fullUrl: string): string {
  if (!fullUrl) return '';

  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    const parts = fullUrl.split('/');
    return parts.length >= 3 ? `${parts[0]}//${parts[2]}` : '';
  }
}

export function createApiProvider<T>(
  token: InjectionToken<T>,
  config: ApiClientsConfig,
  prefix: string,
  useApiBase: boolean = false
): Provider {
  if (config.endpointsConfig && !useApiBase) {
    const isFunction = typeof config.endpointsConfig === 'function';
    if (isFunction) {
      return {
        provide: token,
        useFactory: (): string => {
          const endpoints = (config.endpointsConfig as () => EndpointsConfiguration)();
          const baseUrl = extractBaseUrlFromEndpoints(endpoints, prefix);
          return buildApiUrl(baseUrl, prefix);
        },
      };
    } else {
      const endpoints = config.endpointsConfig as EndpointsConfiguration;
      const baseUrl = extractBaseUrlFromEndpoints(endpoints, prefix);
      return {
        provide: token,
        useValue: buildApiUrl(baseUrl, prefix),
      };
    }
  }

  if (config.apiBaseUrl) {
    const isFunction = typeof config.apiBaseUrl === 'function';
    if (isFunction) {
      return {
        provide: token,
        useFactory: (): string => buildApiUrl((config.apiBaseUrl as () => string)(), prefix),
      };
    } else {
      return {
        provide: token,
        useValue: buildApiUrl(config.apiBaseUrl as string, prefix),
      };
    }
  }

  throw new Error('ApiClientsConfig must provide either endpointsConfig or apiBaseUrl');
}
