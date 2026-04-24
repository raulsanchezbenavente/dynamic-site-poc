export enum EnumFareTypes {
  BASIC = 'BASIC',
  CLASSIC = 'CLASSIC',
  FLEX = 'FLEX',
  BUSINESS_CLASSIC = 'BC CLASSIC',
  BUSINESS_FLEX = 'BC FLEX'
}

export const FARE_ORDER_MAP = {
  [EnumFareTypes.BASIC]: 1,
  [EnumFareTypes.CLASSIC]: 2,
  [EnumFareTypes.FLEX]: 3,
  [EnumFareTypes.BUSINESS_CLASSIC]: 4,
  [EnumFareTypes.BUSINESS_FLEX]: 5
} as const;

export type FareOrderMap = typeof FARE_ORDER_MAP;
