import { BookingCurrency } from '../shared';

export const currenciesSelector: BookingCurrency[] = [
  {
    collectedCurrency: 'RUB',
    exchangeRate: 1,
    name: 'RUB',
  },
  {
    collectedCurrency: 'EUR',
    exchangeRate: 1,
    name: 'EUR',
  },
  {
    collectedCurrency: 'USD',
    exchangeRate: 1,
    name: 'USD',
  },
];

export const defaultCurrency: BookingCurrency = {
  collectedCurrency: 'USD',
  exchangeRate: 1,
  name: 'USD',
};
