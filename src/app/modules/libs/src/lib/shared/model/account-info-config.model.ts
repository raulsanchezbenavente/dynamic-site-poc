import { AccountType } from '../enums/account-type.enum';
import { ProfileDisplayMode } from '../enums/profile-display-mode.enum';

export interface AccountInfoConfig {
  accountType: AccountType;
  profileDisplayMode: ProfileDisplayMode;
}
