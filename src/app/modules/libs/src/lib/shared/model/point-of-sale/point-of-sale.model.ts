export interface PointOfSale {
  name: string;
  stationCode: string;
  code: string;
  default: boolean;
  flagImageCode: string;
  currency: {
    symbol: string;
    code: string;
    name: string;
  };
  countryCode?: string;
  otherCountryCodes?: Array<string>;
  isForRestOfCountries: boolean;
}
