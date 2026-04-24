import { BookingCurrency } from '../booking-currency';

export interface CurrencySelectorConfig {
  currenciesSelector: BookingCurrency[];
  defaultCurrency: BookingCurrency;
  setCurrencyBySessionSettingsResponse: boolean;
}
