export interface CountriesResponse {
  companyCode: string;
  entityCode: string;
  countries: ApiCountry[];
}
export interface ApiCountry {
  codeIso2: string;
  countryCode: string;
  countryName: string;
  defaultLanguage: string;
}

export interface UnifiedCountry {
  name: string;
  code: string;
  currencyCode: string;
  phonePrefix: string;
  order: string;
  languages: Record<string, string>;
}
