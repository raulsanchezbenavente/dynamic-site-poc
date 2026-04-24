import { JourneyStatus, SegmentVM, TransportType } from '@dcx/ui/libs';

import {
  LEGS_DEPARTURE_SEG_1_FAKE,
  LEGS_DEPARTURE_SEG_2_FAKE,
  LEGS_DEPARTURE_SEG_3_FAKE,
  LEGS_RETURN_SEG_1_FAKE,
  LEGS_RETURN_SEG_2_FAKE,
} from './legs.fake';

export const SEGMENTS_DEPARTURE_FAKE: SegmentVM[] = [
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
      number: '1164',
      model: 'BOEING7878',
      manufacturer: 'BOEING',
    },
    legs: LEGS_DEPARTURE_SEG_1_FAKE,
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
    legs: LEGS_DEPARTURE_SEG_2_FAKE,
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
    legs: LEGS_DEPARTURE_SEG_3_FAKE,
    status: JourneyStatus.CONFIRMED,
  },
];

export const SEGMENTS_RETURN_FAKE: SegmentVM[] = [
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
    legs: LEGS_RETURN_SEG_1_FAKE,
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
      country: 'Brasil',
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
    legs: LEGS_RETURN_SEG_2_FAKE,
    status: JourneyStatus.CONFIRMED,
  },
];
