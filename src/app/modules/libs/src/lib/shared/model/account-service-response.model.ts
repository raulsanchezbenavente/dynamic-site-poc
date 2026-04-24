import { ApiResponse } from '../api-models';

import { AccountServiceItem } from './account-service-item.model';

export interface AccountServiceResponse extends ApiResponse {
  services: AccountServiceItem[];
}
