import { AccountStatus } from '../enums/account-status.enum';
import { GenderType } from '../enums/gender-type.enum';

export interface AccountDto {
  username: string;
  password: string;
  status: AccountStatus;
  title: string;
  gender: GenderType;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
}
