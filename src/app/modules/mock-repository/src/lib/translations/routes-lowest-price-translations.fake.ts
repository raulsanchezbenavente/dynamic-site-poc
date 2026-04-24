import { DictionaryType } from '@dcx/ui/libs';

import { FILTERS_TRANSLATIONS } from './filters-translations.fake';

export const ROUTES_LOWEST_PRICE_TRANSLATIONS: DictionaryType = {
  ...FILTERS_TRANSLATIONS,
  'RoutesLowestPrice.PriceLabels': '',
  'RoutesLowestPrice.SeePricesText': 'See price',
  'RoutesLowestPrice.NoDataFoundText': 'No flight offers with given origin',
  'RoutesLowestPrice.FlightsLoaded': 'Flights are loaded',
  'RoutesLowestPrice.Dropdown.Label_SelectCountry': 'Select country',
  'RoutesLowestPrice.NoResultsAvailable': 'No results available',
  'RoutesLowestPrice.DestinationsLabel': 'result(s)',
  'RoutesLowestPrice.Dropdown.Label_SelectCity': 'Select city',
  'RoutesLowestPrice.PriceLabel': 'Round trip from ',
  'RoutesLowestPrice.PriceLabel.AlternativeCurrency': 'alternative currency',
  'RoutesLowestPrice.PriceLabel.PreviousPrice': 'previous price',
  'RoutesLowestPrice.PriceLabel.DiscountLabel': '% OFF',
};
