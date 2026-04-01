import { ServicesChangeStrategy } from './enums/services-change-strategy.enum';
import { ServicesTransactionStatus } from './enums/services-transaction-status.enum';
import { ItemIncluded } from './item-included.dto';

export interface ServicesServiceDto {
  id: string;
  referenceId: string;
  code: string;
  sellKey: string;
  paxId: string;
  status: ServicesTransactionStatus;
  changeStrategy: ServicesChangeStrategy;
  type: string;
  note: string;
  category: string;
  source: string;
  isChecked: boolean;
  expirationDate: Date;
  included: ItemIncluded;
}
