import { PaymentStatus, PaymentType } from '../../..';

export interface Payment {
  accountNumberId: string;
  amount: number;
  currency: string;
  id?: string;
  paymentDate: string; // Use string to represent DateTime
  paymentMethod: string;
  paymentType: PaymentType;
  referenceId: string;
  status: PaymentStatus;
}
