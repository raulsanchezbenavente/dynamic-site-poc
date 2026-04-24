import type { LegVM } from '@dcx/ui/libs';
import { TransportType } from '@dcx/ui/libs';

/**
 * Represents a fake LegVM[] (`LEGS_DEPARTURE_SEG_1_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {LegVM[]} LEGS_DEPARTURE_SEG_1_BC_FAKE.
 */
// DEPARTURE
export const LEGS_DEPARTURE_SEG_1_BC_FAKE: LegVM[] = [
  {
    origin: 'GIG',
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
];

/**
 * Represents a fake LegVM[] (`LEGS_DEPARTURE_SEG_2_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {LegVM[]} LEGS_DEPARTURE_SEG_2_BC_FAKE.
 */
export const LEGS_DEPARTURE_SEG_2_BC_FAKE: LegVM[] = [
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
];

/**
 * Represents a fake LegVM[] (`LEGS_DEPARTURE_SEG_3_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {LegVM[]} LEGS_DEPARTURE_SEG_3_BC_FAKE.
 */
export const LEGS_DEPARTURE_SEG_3_BC_FAKE: LegVM[] = [
  {
    origin: 'MDE',
    destination: 'PEI',
    duration: '00:52',
    std: new Date('2025-03-25T17:34:00'),
    sta: new Date('2025-03-26T02:26:00'),
    stdutc: new Date('2025-03-25T22:34:00'),
    stautc: new Date('2025-03-26T07:26:00'),
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '9619',
      model: 'A320',
      manufacturer: 'AIRBUS',
    },
  },
];

/**
 * Represents a fake LegVM[] (`LEGS_RETURN_SEG_1_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {LegVM[]} LEGS_RETURN_SEG_1_BC_FAKE.
 */
// RETURN
export const LEGS_RETURN_SEG_1_BC_FAKE: LegVM[] = [
  {
    origin: 'PEI',
    destination: 'BOG',
    duration: '00:50',
    std: new Date('2025-03-27T09:00:00'),
    sta: new Date('2025-03-27T09:50:00'),
    stdutc: new Date('2025-03-27T14:00:00'),
    stautc: new Date('2025-03-27T14:50:00'),
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '9210',
      model: 'A320',
      manufacturer: 'AIRBUS',
    },
  },
];

/**
 * Represents a fake LegVM[] (`LEGS_RETURN_SEG_2_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {LegVM[]} LEGS_RETURN_SEG_2_BC_FAKE.
 */
export const LEGS_RETURN_SEG_2_BC_FAKE: LegVM[] = [
  {
    origin: 'BOG',
    destination: 'GIG',
    duration: '08:30',
    std: new Date('2025-03-27T15:10:00'),
    sta: new Date('2025-03-27T23:40:00'),
    stdutc: new Date('2025-03-27T20:10:00'),
    stautc: new Date('2025-03-28T02:40:00'),
    transport: {
      carrier: { code: 'AV', name: 'Avianca' },
      type: TransportType.PLANE,
      number: '261',
      model: 'BOEING7878',
      manufacturer: 'BOEING',
    },
  },
];
