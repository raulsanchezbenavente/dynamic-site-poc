import { IbeEventTypeEnum } from '../../core';
import { AccountInfoConfig } from '../model/account-info-config.model';
import { AccountInfo } from '../model/account-info.model';

export interface IsUserAuthenticatedResponse {
  type: IbeEventTypeEnum.userAuthenticatedResponse;
  isAuthenticated: boolean;
  accountInfo: AccountInfo;
  accountInfoConfig: AccountInfoConfig;
}
