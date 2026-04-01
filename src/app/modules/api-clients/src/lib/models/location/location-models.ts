export interface QueryResponse_1OfOfLocationAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null {
  success?: boolean;
  result?: ResponseObject_1OfOfLocationAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null;
  error?: unknown;
  [key: string]: unknown;
}

export interface ResponseObject_1OfOfLocationAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null {
  result?: boolean;
  data?: Location;
  [key: string]: unknown;
}

export interface Location {
  [key: string]: unknown;
}

export interface SessionSettingsResponseDto {
  success?: boolean;
  result?: ResponseObject_1OfOfSessionSettingsResponseAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null;
  error?: unknown;
  [key: string]: unknown;
}

export interface ResponseObject_1OfOfSessionSettingsResponseAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null {
  result?: boolean;
  data?: SessionSettingsResponse;
  [key: string]: unknown;
}

export interface SessionSettingsResponse {
  search?: {
    origin?: string;
    destination?: string;
    pax?: Record<string, unknown>;
    tripType?: string;
  };
  currency?: {
    value?: string;
  };
  pointOfSale?: string;
  countryCode?: string;
  isForRestOfCountries?: boolean;
  source?: string;
  cityCode?: string;
  [key: string]: unknown;
}
