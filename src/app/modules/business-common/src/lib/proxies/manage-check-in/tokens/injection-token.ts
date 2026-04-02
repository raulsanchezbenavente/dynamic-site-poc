import { InjectionToken, Provider } from '@angular/core';

import { IManageCheckInProxyInterface } from '../interfaces/manage-check-in-proxy.interface';
import { ManageCheckInProxyService } from '../services/manage-check-in-proxy.service';

export const MANAGE_CHECK_IN_PROXY_SERVICE = new InjectionToken<IManageCheckInProxyInterface>(
  'MANAGE_CHECK_IN_PROXY_SERVICE'
);

export const MANAGE_CHECK_IN_PROXY_PROVIDER: Provider = {
  provide: MANAGE_CHECK_IN_PROXY_SERVICE,
  useExisting: ManageCheckInProxyService,
};
