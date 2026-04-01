import { Country } from './country';

export interface ManageCountriesStrategyOrder {
  countries: Country[];
  maxOrderValue: number;
}
