export const BUSINESS_CONFIG_MOCK = {
  businessConfig: {
    priceWithoutDecimals: false,
    mediaQueriesHelper: [1248, 1024, 768, 640, 480],
    manageCountries: {
      preferredCountriesStrategy: [
        'preferredCountriesByDepartureStationStrategy',
        'preferredCountriesByArrivalStationStrategy',
        'preferredCountriesByConfigStrategy',
      ],
      assetsPath: '/assets/imgs/countries-flags/{country.code}.svg',
      enableFlags: false,
      sortCountriesAlphabetically: true,
    },
  },
  roundingCurrencyFactors: [
    {
      code: 'USD',
      factor: '0.01',
    },
    {
      code: 'COP',
      factor: '0',
    },
  ],
};
