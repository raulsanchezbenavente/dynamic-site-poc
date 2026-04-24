import { CustomerBalance } from './customer-balance.model';
import { CustomerProgram } from './customer-program.model';
import { EliteProgress } from './elite-progress.model';

export interface CustomerAccount {
  firstName: string;
  middleName?: string;
  lastName: string;
  username?: string;
  customerNumber?: string;
  dateOfBirth?: Date | string;
  balance: CustomerBalance;
  customerPrograms: Record<string, CustomerProgram>;
  eliteProgress?: EliteProgress;
}
