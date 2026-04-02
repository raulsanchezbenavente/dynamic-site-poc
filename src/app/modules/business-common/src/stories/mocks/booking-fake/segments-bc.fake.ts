import { JourneyStatus, SegmentVM, TransportType } from '@dcx/ui/libs';

import {
  LEGS_DEPARTURE_SEG_1_BC_FAKE,
  LEGS_DEPARTURE_SEG_2_BC_FAKE,
  LEGS_DEPARTURE_SEG_3_BC_FAKE,
  LEGS_RETURN_SEG_1_BC_FAKE,
  LEGS_RETURN_SEG_2_BC_FAKE,
} from './legs-bc.fake';

/**
 * Represents a fake SegmentVM[] (`SEGMENTS_DEPARTURE_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {SegmentVM[]} SEGMENTS_DEPARTURE_BC_FAKE.
 */
export const SEGMENTS_DEPARTURE_BC_FAKE: SegmentVM[] = [
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
    legs: LEGS_DEPARTURE_SEG_1_BC_FAKE,
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
    legs: LEGS_DEPARTURE_SEG_2_BC_FAKE,
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
      sta: new Date('2025-03-26T02:26:00'),
      stdutc: new Date('2025-03-25T22:34:00'),
      stautc: new Date('2025-03-26T07:26:00'),
    },
    duration: '00:52',
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '9619',
      model: 'A320',
      manufacturer: 'AIRBUS',
    },
    legs: LEGS_DEPARTURE_SEG_3_BC_FAKE,
    status: JourneyStatus.CONFIRMED,
  },
];

/**
 * Represents a fake SegmentVM[] (`SEGMENTS_RETURN_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {SegmentVM[]} SEGMENTS_RETURN_BC_FAKE.
 */
export const SEGMENTS_RETURN_BC_FAKE: SegmentVM[] = [
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
      std: new Date('2025-03-27T09:00:00'),
      sta: new Date('2025-03-27T09:50:00'),
      stdutc: new Date('2025-03-27T14:00:00'),
      stautc: new Date('2025-03-27T14:50:00'),
      atd: new Date('2025-03-27T10:00:00'),
      atdutc: new Date('2025-03-27T15:00:00'),
      ata: new Date('2025-03-27T10:50:00'),
      atautc: new Date('2025-03-27T15:50:00'),
    },
    duration: '00:50',
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '9210',
      model: 'A320',
      manufacturer: 'AIRBUS',
    },
    legs: LEGS_RETURN_SEG_1_BC_FAKE,
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
      std: new Date('2025-03-27T15:10:00'),
      sta: new Date('2025-03-27T23:40:00'),
      stdutc: new Date('2025-03-27T20:10:00'),
      stautc: new Date('2025-03-28T02:40:00'),
      atd: new Date('2025-03-27T16:30:00'),
      atdutc: new Date('2025-03-27T21:30:00'),
      ata: new Date('2025-03-28T01:10:00'),
      atautc: new Date('2025-03-28T06:10:00'),
    },
    duration: '07:15',
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '261',
      model: 'BOEING7878',
      manufacturer: 'BOEING',
    },
    legs: LEGS_RETURN_SEG_2_BC_FAKE,
    status: JourneyStatus.CONFIRMED,
  },
];
