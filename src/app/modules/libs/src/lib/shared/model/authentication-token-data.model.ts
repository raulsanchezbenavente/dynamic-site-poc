import { AccountInfo } from './account-info.model';
import { AccountSettingsDto } from './account-settings-dto.model';

export interface AuthenticationTokenData {
  token: string;
  accountInfo: AccountInfo;
  createdAt: Date;
  refreshedAt: Date;
  refreshedTimes: number;
  accountSettingsDto?: AccountSettingsDto;
}
