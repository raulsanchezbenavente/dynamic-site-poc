export interface PointOfSaleStored {
  posCode: string;
  code?: string;
  name?: string;
  default?: boolean;
  flagImageCode?: string;
  stationCode: string;
  userInteractWithPOSSelectorFlag: boolean;
  imgSrc?: string;
  otherCountryCodes?: string[];
  currency?: {
    code: string;
    name: string;
    symbol: string;
  };
}
