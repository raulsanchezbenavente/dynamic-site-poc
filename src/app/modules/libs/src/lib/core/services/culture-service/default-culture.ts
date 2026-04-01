import { NameOrder, TextDirection } from '../../enums';
import { UserCulture } from '../../models';

export const DEFAULT_CULTURE: UserCulture = {
  language: 'en',
  locale: 'en-US',
  region: 'US',
  // Dates and times
  shortDateFormat: 'MM/DD/YYYY',
  longDateFormat: 'dddd, MMMM D, YYYY',
  timeFormat: 'h:mm A',
  is24HourClock: false,
  firstDayOfWeek: 0, // Sunday
  // Numbers
  decimalSeparator: '.',
  thousandsSeparator: ',',
  // People / text
  nameOrder: NameOrder.FIRST_LAST,
  direction: TextDirection.LEFT_TO_RIGHT,
  // Currency
  currency: 'USD',
};
