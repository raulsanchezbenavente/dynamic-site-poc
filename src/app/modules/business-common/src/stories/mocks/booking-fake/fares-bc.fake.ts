import type { Fare } from '@dcx/ui/libs';

import {
  CHARGES_FARE_1_DEPARTURE_BC_FAKE,
  CHARGES_FARE_1_RETURN_BC_FAKE,
  CHARGES_FARE_2_DEPARTURE_BC_FAKE,
  CHARGES_FARE_2_RETURN_BC_FAKE,
} from './charges-bc.fake';

/**
 * Represents a fake Fare[] (`FARES_DEPARTURE_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Fare[]} FARES_DEPARTURE_BC_FAKE.
 */
export const FARES_DEPARTURE_BC_FAKE: Fare[] = [
  {
    id: '42415349437E7E53454F423042524B7E535E537E4144547E7E3331',
    referenceId: '1',
    fareBasisCode: 'SEOB0BRK',
    classOfService: 'S^S',
    productClass: 'BASIC',
    availableSeats: 0,
    serviceBundleCode: '',
    isRecommended: false,
    charges: CHARGES_FARE_1_DEPARTURE_BC_FAKE,
  },
  {
    id: '42415349437E7E53454F423042524B7E535E537E4348447E7E3331',
    referenceId: '1',
    fareBasisCode: 'SEOB0BRK',
    classOfService: 'S^S',
    productClass: 'BASIC',
    availableSeats: 0,
    serviceBundleCode: '',
    isRecommended: false,
    charges: CHARGES_FARE_2_DEPARTURE_BC_FAKE,
  },
];

/**
 * Represents a fake Fare[] (`FARES_RETURN_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Fare[]} FARES_RETURN_BC_FAKE.
 */
export const FARES_RETURN_BC_FAKE: Fare[] = [
  {
    id: '434C41535349437E7E45454F423242524B7E457E4144547E7E3332',
    referenceId: '2',
    fareBasisCode: 'EEOB2BRK',
    classOfService: 'E',
    productClass: 'CLASSIC',
    availableSeats: 0,
    serviceBundleCode: '',
    charges: CHARGES_FARE_1_RETURN_BC_FAKE,
    isRecommended: false,
  },
  {
    id: '434C41535349437E7E45454F423242524B7E457E4348447E7E3332',
    referenceId: '2',
    fareBasisCode: 'EEOB2BRK',
    classOfService: 'E',
    productClass: 'CLASSIC',
    availableSeats: 0,
    serviceBundleCode: '',
    charges: CHARGES_FARE_2_RETURN_BC_FAKE,
    isRecommended: false,
  },
];
