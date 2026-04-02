import type { Charge } from '@dcx/ui/libs';

export const CHARGES_FARE_1_DEPARTURE_BC_FAKE: Charge[] = [
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

/**
 * Represents a fake Charge[] (`CHARGES_FARE_2_DEPARTURE_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Charge[]} CHARGES_FARE_2_DEPARTURE_BC_FAKE.
 */
export const CHARGES_FARE_2_DEPARTURE_BC_FAKE: Charge[] = [
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

/**
 * Represents a fake Charge[] (`CHARGES_FARE_1_RETURN_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Charge[]} CHARGES_FARE_1_RETURN_BC_FAKE.
 */
export const CHARGES_FARE_1_RETURN_BC_FAKE: Charge[] = [
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

/**
 * Represents a fake Charge[] (`CHARGES_FARE_2_RETURN_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Charge[]} CHARGES_FARE_2_RETURN_BC_FAKE.
 */
export const CHARGES_FARE_2_RETURN_BC_FAKE: Charge[] = [
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
