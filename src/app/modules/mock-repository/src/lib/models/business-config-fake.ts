import { BusinessConfig, I18N_VALUES, PaxTypeCode } from '@dcx/ui/libs';

export const BUSINESS_CONFIG_MOCK: BusinessConfig = {
  imagePopUpFrecuencyTime: 24 * 60 * 60 * 1000,
  pointOfSale: {
    minPointsOfSaleToShowPopup: 5,
    assetsPathCountriesFlag: 'assets/imgs/countries-flags/{countryCode}.svg',
    assetsPathCountriesOthers: 'assets/imgs/countries-flags/other.svg.png',
    assetsPathLogo: 'assets/imgs/logo.svg',
  },
  cultureAlias: {
    'en-US': 'en',
    'es-ES': 'es',
    'pt-BR': 'pt',
    'fr-FR': 'fr',
  },
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
  prefixValidationMessage: {
    invalid: 'Common.Form.Validations.Prefix.InvalidMessage',
    valid: '',
    hint: '',
  },
  phoneValidationMessage: {
    invalid: 'Common.Form.Validations.Phone.InvalidMessage',
    valid: '',
    hint: '',
  },
  passengers: [
    {
      ibeCode: 'ADT',
      type: PaxTypeCode.ADT,
      ageFrom: '12',
      ageTo: '117',
      order: 1,
      validatedTitleGroup: true,
      singularName: 'Adult',
      pluralName: 'Adults',
      titleGroup: [
        {
          code: 'MR',
          name: 'MR', // translation
          gender: 'Male',
          order: 1,
        },
        {
          code: 'MRS',
          name: 'MRS', // translation
          gender: 'Female',
          order: 2,
        },
        {
          code: 'MS',
          name: 'MSS', // translation
          gender: 'Female',
          order: 3,
        },
      ],
    },
    {
      ibeCode: 'CHD',
      type: 'CHD',
      ageFrom: '2',
      ageTo: '11',
      order: 2,
      validatedTitleGroup: false,
      singularName: 'Child',
      pluralName: 'Children',
      titleGroup: [
        {
          code: 'MR',
          name: 'MR', // translation
          gender: 'Male',
          order: 1,
        },
        {
          code: 'MISS',
          name: 'MISS', // translation
          gender: 'Female',
          order: 2,
        },
      ],
    },
    {
      ibeCode: 'INF',
      type: 'INF',
      ageFrom: '0',
      ageTo: '1',
      order: 3,
      validatedTitleGroup: false,
      singularName: 'Infant',
      pluralName: 'Infants',
      titleGroup: [
        {
          code: 'MSTR',
          name: 'MASTER', // translation
          gender: 'Male',
          order: 1,
        },
        {
          code: 'MISS',
          name: 'MISS', // translation
          gender: 'Female',
          order: 2,
        },
      ],
    },
    {
      ibeCode: 'INS',
      type: 'INS',
      ageFrom: '0',
      ageTo: '1',
      order: 3,
      validatedTitleGroup: false,
      singularName: 'Infant with seat',
      pluralName: 'Infants with seat',
      titleGroup: [
        {
          code: 'MSTR',
          name: 'MASTER', // translation
          gender: 'Male',
          order: 1,
        },
        {
          code: 'MISS',
          name: 'MISS', // translation
          gender: 'Female',
          order: 2,
        },
      ],
    },
  ],
  sessionKey: 'sessionKey',
  I18N_Values: I18N_VALUES,
  path_CDN: 'https://av-static-dev3.newshore.es/',
  apiURLAccounts: location.protocol + '//ns-booking-dev.newshore.es/accounts/api/v1',
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
