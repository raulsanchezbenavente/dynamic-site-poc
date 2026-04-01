import { Charge } from '@dcx/ui/libs';

export const CHARGES_FARE_1_DEPARTURE_FAKE: Charge[] = [
  {
    type: 'Fare',
    code: 'BASIC',
    amount: 164,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'COAE',
    amount: 10.04,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'YSTR',
    amount: 31.16,
    currency: 'COP',
  },
];
export const CHARGES_FARE_2_DEPARTURE_FAKE: Charge[] = [
  {
    type: 'Fare',
    code: 'BASIC',
    amount: 122,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'COAE',
    amount: 10.04,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'YSTR',
    amount: 23.18,
    currency: 'COP',
  },
];

export const CHARGES_FARE_1_RETURN_FAKE: Charge[] = [
  {
    type: 'Fare',
    code: 'CLASSIC',
    amount: 164,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'COAE',
    amount: 10.04,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'YSTR',
    amount: 31.16,
    currency: 'COP',
  },
];
export const CHARGES_FARE_2_RETURN_FAKE: Charge[] = [
  {
    type: 'Fare',
    code: 'CLASSIC',
    amount: 122,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'COAE',
    amount: 10.04,
    currency: 'COP',
  },
  {
    type: 'Tax',
    code: 'YSTR',
    amount: 23.18,
    currency: 'COP',
  },
];
