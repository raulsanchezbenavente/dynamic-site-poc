import { IbeEvent, IbeEventTypeEnum } from '../../../core';

export interface CurrencySelectedEvent extends IbeEvent {
  type: IbeEventTypeEnum.currencySelectedEvent;
  currency: string;
  userInteractWithCurrencySelectorFlag: boolean;
}
