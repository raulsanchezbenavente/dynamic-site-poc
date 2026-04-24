import { ConfirmationStatus } from './enums/confirmation-status.enum';
import { PaymentStatusExtraInfo } from './payment-status-extra-info.dto';

export interface PaymentStatusDto {
  message: string;
  statusCode: string;
  transactionState: ConfirmationStatus;
  cusCode: string;
  paymentType: string;
  paymentStatusExtraInfo: PaymentStatusExtraInfo;
}
