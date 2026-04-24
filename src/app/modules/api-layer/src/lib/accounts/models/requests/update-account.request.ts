import { AccountDto } from '../dtos/account/account.dto';

export interface UpdateAccountRequest {
  id: string;
  account: AccountDto;
}
