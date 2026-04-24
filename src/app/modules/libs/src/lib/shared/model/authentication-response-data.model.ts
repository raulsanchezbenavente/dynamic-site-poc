import { AccountInfo } from './account-info.model';

import { AccountSettingsDto } from '.';

export class AuthenticationResponseData {
  securityToken!: string;
  accountInfo!: AccountInfo;
  /**
   * States if the user was successfully logged in
   */
  isLoggedIn!: boolean;
  /**
   * Message used when user could not be logged in
   */
  message!: string;
  accountSettingsDto?: AccountSettingsDto;
}
