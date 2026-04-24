import { InjectionToken, Provider } from '@angular/core';

import { ISegmentsStatusProxyInterface } from '../interfaces/segments-status-proxy.interface';
import { SegmentsStatusProxyService } from '../services/segments-status-proxy.service';

export const SEGMENTS_STATUS_PROXY_SERVICE = new InjectionToken<ISegmentsStatusProxyInterface>(
  'SEGMENTS_STATUS_PROXY_SERVICE'
);

export const SEGMENTS_STATUS_PROXY_PROVIDER: Provider = {
  provide: SEGMENTS_STATUS_PROXY_SERVICE,
  useExisting: SegmentsStatusProxyService,
};
