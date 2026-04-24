import { PaymentFrequency } from '../enums/payment-frequency.enum';

import { PriceDto } from './price.dto';

export interface MembershipDto {
  type: string;
  issuedDate: Date;
  expirationDate: Date;
  price: PriceDto;
  paymentFrequency: PaymentFrequency;
}
