import { IbeEventTypeEnum } from '../../core';
import { AccountType } from '../enums/account-type.enum';
import { FormType } from '../enums/form-type.enum';
import { AuthenticationResponseData } from '../model/authentication-response-data.model';

export interface AuthenticatedUserLoggedInEvent {
  type: IbeEventTypeEnum.authenticatedUserLoggedIn;
  authData: AuthenticationResponseData;
  loginSource: FormType;
  accountType: AccountType;
  redirect?: boolean;
}
