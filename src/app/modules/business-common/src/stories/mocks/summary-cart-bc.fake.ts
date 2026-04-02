import type { SummaryCartConfig } from '@dcx/storybook/business-common';
import type { Booking } from '@dcx/ui/libs';
import {
  ButtonStyles,
  JourneyStatus,
  JourneyType,
  PaxTypeCode,
  SummaryTypologyTemplate,
  TransportType,
} from '@dcx/ui/libs';

import { SUMMARY_CART_TRANSLATIONS_BC } from './translations/summary-cart-translations-bc.fake';

/**
 * Represents a fake SummaryCartConfig (`SUMMARY_CART_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {SummaryCartConfig} SUMMARY_CART_BC_FAKE.
 */
export const SUMMARY_CART_BC_FAKE: SummaryCartConfig = {
  toggleButton: {
    label: '',
    icon: {
      name: 'cart',
    },
    layout: {
      style: ButtonStyles.SECONDARY,
    },
    ariaAttributes: {
      ariaLabel: 'Cart summary',
    },
  },
  details: {
    journeys: {
      outbound: {
        journey: {
          id: '3432344634373745343335343437374533393337333533383745343135363745333233303332333432443330333832443331333437453335333333353334333333317E3433353434373745353034353439374533393333333833393745343135363745333233303332333432443330333832443331333437453335333333353334333333327E3331',

          origin: {
            city: 'Rio de Janeiro',
            iata: 'PEI',
            terminal: '2',
            airportName: 'Aeropuerto Santos Dummond',
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
            sta: new Date('2025-03-25T18:26:00'),
            stdutc: new Date('2025-03-25T10:25:00'),
            stautc: new Date('2025-03-25T23:26:00'),
          },
          duration: '13:01:40',
          segments: [
            {
              id: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
              referenceId: 'ST1',
              origin: {
                city: 'Rio de Janeiro',
                iata: 'GIG',
                terminal: '2',
                country: 'Brazil',
              },
              destination: {
                city: 'Bogotá',
                iata: 'BOG',
                terminal: '1A',
                country: 'Colombia',
              },
              schedule: {
                std: new Date('2025-03-25T07:25:00'),
                sta: new Date('2025-03-25T11:40:00'),
                stdutc: new Date('2025-03-25T10:25:00'),
                stautc: new Date('2025-03-25T14:40:00'),
              },
              duration: '06:15',
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
                type: TransportType.PLANE,
                number: '260',
                model: 'BOEING7878',
                manufacturer: 'BOEING',
              },
              legs: [
                {
                  origin: 'RIO',
                  destination: 'BOG',
                  duration: '06:15',
                  std: new Date('2025-03-25T07:25:00'),
                  sta: new Date('2025-03-25T11:40:00'),
                  stdutc: new Date('2025-03-25T10:25:00'),
                  stautc: new Date('2025-03-25T14:40:00'),
                  transport: {
                    carrier: { code: 'AV', name: 'Avianca' },
                    type: TransportType.PLANE,
                    number: '260',
                    model: 'BOEING7878',
                    manufacturer: 'BOEING',
                  },
                },
              ],
              status: JourneyStatus.CONFIRMED,
            },
            {
              id: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
              referenceId: 'ST2',
              origin: {
                city: 'Bogotá',
                iata: 'BOG',
                terminal: '1A',
                country: 'Colombia',
              },
              destination: {
                city: 'Medellín',
                iata: 'MDE',
                terminal: '1',
                country: 'Colombia',
              },
              schedule: {
                std: new Date('2025-03-25T13:59:00'),
                sta: new Date('2025-03-25T14:58:00'),
                stdutc: new Date('2025-03-25T18:59:00'),
                stautc: new Date('2025-03-25T19:58:00'),
              },
              duration: '00:59',
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
                type: TransportType.PLANE,
                number: '9318',
                model: 'A320',
                manufacturer: 'AIRBUS',
              },
              legs: [
                {
                  origin: 'BOG',
                  destination: 'MDE',
                  duration: '00:59',
                  std: new Date('2025-03-25T13:59:00'),
                  sta: new Date('2025-03-25T14:58:00'),
                  stdutc: new Date('2025-03-25T18:59:00'),
                  stautc: new Date('2025-03-25T19:58:00'),
                  transport: {
                    carrier: { code: 'AV', name: 'Avianca' },
                    type: TransportType.PLANE,
                    number: '9318',
                    model: 'A320',
                    manufacturer: 'AIRBUS',
                  },
                },
              ],
              status: JourneyStatus.CONFIRMED,
            },
            {
              id: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
              referenceId: 'ST3',
              origin: {
                city: 'Medellín',
                iata: 'MDE',
                terminal: '1',
                country: 'Colombia',
              },
              destination: {
                city: 'Pereira',
                iata: 'PEI',
                terminal: '4',
                country: 'Colombia',
              },
              schedule: {
                std: new Date('2025-03-25T17:34:00'),
                sta: new Date('2025-03-25T18:26:00'),
                stdutc: new Date('2025-03-25T22:34:00'),
                stautc: new Date('2025-03-25T23:26:00'),
              },
              duration: '00:52',
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
                type: TransportType.PLANE,
                number: '9619',
                model: 'A320',
                manufacturer: 'AIRBUS',
              },
              legs: [
                {
                  origin: 'MDE',
                  destination: 'PEI',
                  duration: '00:52',
                  std: new Date('2025-03-25T17:34:00'),
                  sta: new Date('2025-03-25T18:26:00'),
                  stdutc: new Date('2025-03-25T22:34:00'),
                  stautc: new Date('2025-03-25T23:26:00'),
                  transport: {
                    carrier: { code: 'AV', name: 'Avianca' },
                    type: TransportType.PLANE,
                    number: '9619',
                    model: 'A320',
                    manufacturer: 'AIRBUS',
                  },
                },
              ],
              status: JourneyStatus.CONFIRMED,
            },
          ],

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
              id: 'fareId1',
              referenceId: '0~T~ ~JM~TOW~1000~~0~1~~X',
              fareBasisCode: 'BASIC',
              classOfService: 'T',
              productClass: 'BASIC',
              availableSeats: 0,
              charges: [
                {
                  type: 'Fare',
                  code: 'Fare',
                  amount: 6000.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'UG',
                  amount: 1040.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'UL',
                  amount: 4850.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'GHF',
                  amount: 1250.0,
                  currency: 'KES',
                },
              ],
              serviceBundleCode: '',
            },
          ],

          checkinInfo: {
            openingCheckInDate: new Date('2025-01-22T18:20:00'),
            closingCheckInDate: new Date('2025-01-24T19:20:00'),
          },
        },
      },
      inbound: {
        journey: {
          id: '3530343534393745343234463437374533393332333533363745343135363745333233303332333432443330333832443332333537453335333333353334333333337E3332',

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
            airportName: 'Aeropuerto Santos Dummond',
            country: 'Brasil',
          },
          schedule: {
            std: new Date('2025-03-25T07:25:00'),
            sta: new Date('2025-03-25T18:26:00'),
            stdutc: new Date('2025-03-25T10:25:00'),
            stautc: new Date('2025-03-25T23:26:00'),
          },
          duration: '13:01:40',
          segments: [
            {
              id: '5045497E424F477E393231307E41567E323032352D30332D32397E525431',
              referenceId: 'RT1',
              origin: {
                city: 'Pereira',
                iata: 'PEI',
                terminal: '1',
                country: 'Colombia',
              },
              destination: {
                city: 'Bogotá',
                iata: 'BOG',
                terminal: '1A',
                country: 'Colombia',
              },
              schedule: {
                std: new Date('2025-03-29T09:10:00'),
                sta: new Date('2025-03-29T10:00:00'),
                stdutc: new Date('2025-03-29T14:10:00'),
                stautc: new Date('2025-03-29T15:00:00'),
              },
              duration: '00:50',
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
                type: TransportType.PLANE,
                number: '9210',
                model: 'A320',
                manufacturer: 'AIRBUS',
              },
              legs: [
                {
                  origin: 'PEI',
                  destination: 'BOG',
                  duration: '00:50',
                  std: new Date('2025-03-29T09:10:00'),
                  sta: new Date('2025-03-29T10:00:00'),
                  stdutc: new Date('2025-03-29T14:10:00'),
                  stautc: new Date('2025-03-29T15:00:00'),
                  transport: {
                    carrier: { code: 'AV', name: 'Avianca' },
                    type: TransportType.PLANE,
                    number: '9210',
                    model: 'A320',
                    manufacturer: 'AIRBUS',
                  },
                },
              ],
              status: JourneyStatus.CONFIRMED,
            },
            {
              id: '424F477E4749477E3236317E41567E323032352D30332D32397E525432',
              referenceId: 'RT2',
              origin: {
                city: 'Bogotá',
                iata: 'BOG',
                terminal: '1A',
                country: 'Colombia',
              },
              destination: {
                city: 'Rio de Janeiro',
                iata: 'GIG',
                terminal: '2',
                country: 'Brazil',
              },
              schedule: {
                std: new Date('2025-03-29T15:30:00'),
                sta: new Date('2025-03-29T22:45:00'),
                stdutc: new Date('2025-03-29T20:30:00'),
                stautc: new Date('2025-03-30T01:45:00'),
              },
              duration: '07:15',
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
                type: TransportType.PLANE,
                number: '261',
                model: 'BOEING7878',
                manufacturer: 'BOEING',
              },
              legs: [
                {
                  origin: 'BOG',
                  destination: 'GIG',
                  duration: '07:15',
                  std: new Date('2025-03-29T15:30:00'),
                  sta: new Date('2025-03-29T22:45:00'),
                  stdutc: new Date('2025-03-29T20:30:00'),
                  stautc: new Date('2025-03-30T01:45:00'),
                  transport: {
                    carrier: { code: 'AV', name: 'Avianca' },
                    type: TransportType.PLANE,
                    number: '261',
                    model: 'BOEING7878',
                    manufacturer: 'BOEING',
                  },
                },
              ],
              status: JourneyStatus.CONFIRMED,
            },
          ],

          journeyType: JourneyType.INBOUND,
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
              id: 'fare2',
              referenceId: '0~T~ ~JM~TOW~1000~~0~1~~X',
              fareBasisCode: 'CLASSIC',
              classOfService: 'T1',
              productClass: 'CLASSIC',
              availableSeats: 0,
              charges: [
                {
                  type: 'Fare',
                  code: 'Fare',
                  amount: 6000.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'UG',
                  amount: 1040.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'UL',
                  amount: 4850.0,
                  currency: 'KES',
                },
                {
                  type: 'Fee',
                  code: 'GHF',
                  amount: 1250.0,
                  currency: 'KES',
                },
              ],
              serviceBundleCode: '',
            },
          ],

          checkinInfo: {
            openingCheckInDate: new Date('2025-01-22T18:20:00'),
            closingCheckInDate: new Date('2025-01-24T19:20:00'),
          },
        },
      },
    },
    summaryTypologyConfig: {
      showInfoForSelectedFlight: false,
      voucherMask: 'Voucher',
      useTypologyItem: true,
      showPaxGroup: true,
      useStaticDetails: true,
      isCollapsible: true,
      bookingSellTypeServices: [],
      displayPriceItemConcepts: true,
      summaryScopeView: SummaryTypologyTemplate.PER_BOOKING,
      booking: {} as Booking,
      translations: {
        ...SUMMARY_CART_TRANSLATIONS_BC,
      },
    },
  },
};
