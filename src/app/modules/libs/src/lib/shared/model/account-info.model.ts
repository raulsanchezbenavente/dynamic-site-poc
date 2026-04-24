import { AccountType } from '../enums/account-type.enum';

export interface AccountInfo {
  type: AccountType;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  cultureCode: string;
  isSocialMediaAccount?: boolean;
  referenceId?: string;
}
