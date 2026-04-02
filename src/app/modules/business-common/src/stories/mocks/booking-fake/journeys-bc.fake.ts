import type { JourneyVM, TotalPaxVm } from '@dcx/ui/libs';
import { JourneyStatus, JourneyType, PaxTypeCode } from '@dcx/ui/libs';

import {
  AVAILABLE_FARES_BASIC_FAKE,
  AVAILABLE_FARES_CLASSIC_FAKE,
  AVAILABLE_FARES_FLEX_FAKE,
} from './available-fares-bc.fake';
import { SEGMENTS_DEPARTURE_BC_FAKE, SEGMENTS_RETURN_BC_FAKE } from './segments-bc.fake';

export const TOTAL_PAX_BC_VM_FAKE: TotalPaxVm[] = [
  {
    total: 2,
    type: PaxTypeCode.ADT,
  },
  {
    total: 2,
    type: PaxTypeCode.TNG,
  },
  {
    total: 1,
    type: PaxTypeCode.CHD,
  },
];

/**
 * Represents a fake JourneyVM[] (`JOURNEYS_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {JourneyVM[]} JOURNEYS_BC_FAKE.
 */
export const JOURNEYS_BC_FAKE: JourneyVM[] = [
  {
    id: '3432344634373745343335343437374533393337333533383745343135363745333233303332333432443330333832443331333437453335333333353334333333317E3433353434373745353034353439374533393333333833393745343135363745333233303332333432443330333832443331333437453335333333353334333333327E3331',
    status: JourneyStatus.CONFIRMED,
    origin: {
      city: 'Rio de Janeiro',
      iata: 'GIG',
      terminal: '2',
      airportName: 'Aeropuerto Internacional de Rio de Janeiro',
      country: 'Brasil',
    },
    destination: {
      city: 'Pereira',
      iata: 'PEI',
      terminal: '4S',
      airportName: 'Aeropuerto Internacional Matecaña',
      country: 'Colombia',
    },
    schedule: {
      std: new Date('2025-03-25T07:25:00'),
      sta: new Date('2025-03-26T02:26:00'),
      stdutc: new Date('2025-03-25T10:25:00'),
      stautc: new Date('2025-03-26T07:26:00'),
    },
    duration: '01:01:40',
    segments: SEGMENTS_DEPARTURE_BC_FAKE,

    journeyType: JourneyType.OUTBOUND,
    totalPax: [
      {
        total: 2,
        type: PaxTypeCode.ADT,
      },
      {
        total: 2,
        type: PaxTypeCode.TNG,
      },
      {
        total: 1,
        type: PaxTypeCode.CHD,
      },
    ],

    fares: [
      {
        order: 1,
        isSelected: true,
        id: 'fareId1',
        referenceId: '0~T~ ~JM~TOW~1000~~0~1~~X',
        fareBasisCode: 'BASIC',
        classOfService: 'T',
        productClass: 'BASIC',
        serviceBundleCode: '',
        availableSeats: 0,
        benefitsList: AVAILABLE_FARES_BASIC_FAKE,
        charges: [
          {
            type: 'Fare',
            code: 'Fare',
            amount: 600.4,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UG',
            amount: 140.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UL',
            amount: 4850.3,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'GHF',
            amount: 1250.0,
            currency: 'COP',
          },
        ],
      },
      {
        order: 2,
        isRecommended: true,
        isSelected: false,
        id: 'fare2',
        referenceId: '0~T~ ~JM~TOW~1000~~0~1~~XY',
        fareBasisCode: 'CLASSIC',
        classOfService: 'T',
        productClass: 'CLASSIC',
        serviceBundleCode: '',
        availableSeats: 100,
        benefitsList: AVAILABLE_FARES_CLASSIC_FAKE,
        charges: [
          {
            type: 'Fare',
            code: 'Fare',
            amount: 6300.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UL',
            amount: 4850.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'GHF',
            amount: 30.0,
            currency: 'COP',
          },
        ],
      },
      {
        order: 3,
        isSelected: false,
        id: 'fareId3',
        referenceId: '0~T~ ~JM~TOW~1000~~0~1~~XYZ',
        fareBasisCode: 'FLEX',
        classOfService: 'T',
        productClass: 'FLEX',
        availableSeats: 20,
        benefitsList: AVAILABLE_FARES_FLEX_FAKE,
        serviceBundleCode: '',
        charges: [
          {
            type: 'Fare',
            code: 'Fare',
            amount: 34400.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UG',
            amount: 10080.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UL',
            amount: 4850.0,
            currency: 'COP',
          },
        ],
      },
    ],

    checkinInfo: {
      openingCheckInDate: new Date('2025-01-22T18:20:00'),
      closingCheckInDate: new Date('2025-01-24T19:20:00'),
    },
  },
  {
    id: '3530343534393745343234463437374533393332333533363745343135363745333233303332333432443330333832443332333537453335333333353334333333337E3332',
    status: JourneyStatus.DELAYED,
    origin: {
      city: 'Pereira',
      iata: 'PEI',
      terminal: '3S',
      airportName: 'Aeropuerto Internacional Matecaña',
      country: 'Colombia',
    },
    destination: {
      city: 'Rio de Janeiro',
      iata: 'GIG',
      terminal: '2',
      airportName: 'Aeropuerto Internacional de Rio de Janeiro',
      country: 'Brasil',
    },
    schedule: {
      std: new Date('2025-03-27T09:00:00'),
      sta: new Date('2025-03-27T23:40:00'),
      stdutc: new Date('2025-03-27T14:00:00'),
      stautc: new Date('2025-03-28T02:40:00'),
    },
    duration: '14:40',
    segments: SEGMENTS_RETURN_BC_FAKE,

    journeyType: JourneyType.RETURN,
    totalPax: [
      {
        total: 2,
        type: PaxTypeCode.ADT,
      },
      {
        total: 2,
        type: PaxTypeCode.TNG,
      },
      {
        total: 1,
        type: PaxTypeCode.CHD,
      },
    ],

    fares: [
      {
        isSelected: true,
        order: 2,
        id: 'fareId2',
        referenceId: '0~T~ ~JM~TOW~1000~~0~1~~X',
        fareBasisCode: 'CLASSIC',
        classOfService: 'T1',
        productClass: 'CLASSIC',
        serviceBundleCode: '',
        availableSeats: 0,
        benefitsList: AVAILABLE_FARES_CLASSIC_FAKE,
        charges: [
          {
            type: 'Fare',
            code: 'Fare',
            amount: 6000.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UG',
            amount: 1040.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'UL',
            amount: 4850.0,
            currency: 'COP',
          },
          {
            type: 'Fee',
            code: 'GHF',
            amount: 1250.0,
            currency: 'COP',
          },
        ],
      },
    ],

    checkinInfo: {
      openingCheckInDate: new Date('2025-01-22T18:20:00'),
      closingCheckInDate: new Date('2025-01-24T19:20:00'),
    },
  },
];
