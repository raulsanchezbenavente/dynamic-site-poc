export interface Payment {
  paymentMethod: string;
  cardHolder?: string;
  cardNumber?: string;
  expirationYear?: number;
  expirationMonth?: number;
  verifyCode?: string;
  dccInfo?: {
    dccStatus?: number;
    foreignCurrencyCode: string;
    foreignAmount: number;
    foreignExchangeRate: number;
  };
  paymentType: string;
  currency: string;
  amount: number;
  availableAmount?: number;
  paymentDate: string;
  status: string;
  id: string;
  referenceId: string;
  accountNumber?: string;
  voucherId?: string;
  redirectionUrl?: string;
  points?: number;
  transactionId?: string;
  voucherHolderName?: string;
}
