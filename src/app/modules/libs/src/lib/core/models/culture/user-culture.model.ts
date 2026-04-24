import { NameOrder, TextDirection } from '../../enums';

export interface UserCulture {
  language?: string;
  shortDateFormat?: string;
  longDateFormat?: string;
  timeFormat?: string;
  is24HourClock?: boolean;
  firstDayOfWeek?: number;
  decimalSeparator?: string;
  thousandsSeparator?: string;
  locale?: string;
  region?: string;
  nameOrder?: NameOrder;
  currency?: string;
  direction?: TextDirection;
}
