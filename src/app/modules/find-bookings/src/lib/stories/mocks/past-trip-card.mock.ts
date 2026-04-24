import { TransportType } from '@dcx/ui/libs';
import type { Carrier, JourneyLocation, SegmentVM } from '@dcx/ui/libs';

import type { PastTripCardVM } from '../../components/past-trip-card/models/past-trip-card-vm.model';

const BASE_DATE = new Date(Date.UTC(2025, 8, 15, 10, 0, 0)); // 15 Sep 2025 10:00 UTC
const WEEK_BEFORE = new Date(Date.UTC(2025, 8, 8, 9, 30, 0)); // 8 Sep 2025 09:30 UTC
const TWO_WEEKS_BEFORE = new Date(Date.UTC(2025, 8, 1, 6, 45, 0)); // 1 Sep 2025 06:45 UTC
const THREE_DAYS_BEFORE = new Date(Date.UTC(2025, 8, 12, 14, 15, 0)); // 12 Sep 2025 14:15 UTC
const FOUR_DAYS_BEFORE = new Date(Date.UTC(2025, 8, 11, 7, 5, 0)); // 11 Sep 2025 07:05 UTC

function addHours(base: Date, h: number): Date {
  return new Date(base.getTime() + h * 3600000);
}

function createSegment(
  id: string,
  origin: JourneyLocation,
  destination: JourneyLocation,
  start: Date,
  durationHours: number,
  transport: { carrier: Carrier; number: string; model: string }
): SegmentVM {
  const END_DATE = addHours(start, durationHours);
  return {
    id,
    referenceId: id.toUpperCase(),
    origin,
    destination,
    schedule: {
      std: start,
      stdutc: start,
      sta: END_DATE,
      stautc: END_DATE,
      etd: start,
      etdutc: start,
      eta: END_DATE,
      etautc: END_DATE,
    },
    legs: [],
    duration: `${String(durationHours).padStart(2, '0')}:00`,
    transport: {
      type: TransportType.PLANE,
      carrier: transport.carrier,
      number: transport.number,
      model: transport.model,
    },
  };
}

// 1. Connection trip (Bogotá -> Miami -> New York)
export const PAST_TRIP_DEFAULT: PastTripCardVM = {
  origin: { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
  destination: { city: 'New York', iata: 'JFK', country: 'US', terminal: '4' },
  schedule: {
    std: BASE_DATE,
    stdutc: BASE_DATE,
    sta: addHours(BASE_DATE, 9),
    stautc: addHours(BASE_DATE, 9),
    etd: BASE_DATE,
    etdutc: BASE_DATE,
    eta: addHours(BASE_DATE, 9),
    etautc: addHours(BASE_DATE, 9),
  },
  segments: [
    createSegment(
      'seg1',
      { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
      { city: 'Miami', iata: 'MIA', country: 'US', terminal: '2' },
      BASE_DATE,
      4,
      { carrier: { code: 'AV', name: 'Avianca' }, number: 'AV123', model: 'A320' }
    ),
    createSegment(
      'seg2',
      { city: 'Miami', iata: 'MIA', country: 'US', terminal: '2' },
      { city: 'New York', iata: 'JFK', country: 'US', terminal: '4' },
      addHours(BASE_DATE, 5),
      4,
      { carrier: { code: 'DL', name: 'Delta Airlines' }, number: 'DL456', model: 'B737' }
    ),
  ],
};

// 2. Single carrier trip (Bogotá -> Miami)
export const PAST_TRIP_SINGLE_CARRIER: PastTripCardVM = {
  ...PAST_TRIP_DEFAULT,
  destination: { city: 'Miami', iata: 'MIA', country: 'US', terminal: '2' },
  schedule: {
    std: BASE_DATE,
    stdutc: BASE_DATE,
    sta: addHours(BASE_DATE, 4),
    stautc: addHours(BASE_DATE, 4),
    etd: BASE_DATE,
    etdutc: BASE_DATE,
    eta: addHours(BASE_DATE, 4),
    etautc: addHours(BASE_DATE, 4),
  },
  segments: PAST_TRIP_DEFAULT.segments.slice(0, 1),
};

// 3. Regional trip (Cali -> Lima)
export const PAST_TRIP_CLO_LIM: PastTripCardVM = {
  origin: { city: 'Cali', iata: 'CLO', country: 'CO', terminal: '1' },
  destination: { city: 'Lima', iata: 'LIM', country: 'PE', terminal: 'T' },
  schedule: {
    std: WEEK_BEFORE,
    stdutc: WEEK_BEFORE,
    sta: addHours(WEEK_BEFORE, 3),
    stautc: addHours(WEEK_BEFORE, 3),
    etd: WEEK_BEFORE,
    etdutc: WEEK_BEFORE,
    eta: addHours(WEEK_BEFORE, 3),
    etautc: addHours(WEEK_BEFORE, 3),
  },
  segments: [
    createSegment(
      'segCLO1',
      { city: 'Cali', iata: 'CLO', country: 'CO', terminal: '1' },
      { city: 'Lima', iata: 'LIM', country: 'PE', terminal: 'T' },
      WEEK_BEFORE,
      3,
      { carrier: { code: 'AV', name: 'Avianca' }, number: 'AV782', model: 'A319' }
    ),
  ],
};

// 4. Multi-leg regional trip (Medellín -> Bogotá -> Guatemala)
export const PAST_TRIP_MDE_GUA: PastTripCardVM = {
  origin: { city: 'Medellín', iata: 'MDE', country: 'CO', terminal: '2' },
  destination: { city: 'Guatemala City', iata: 'GUA', country: 'GT', terminal: '1' },
  schedule: {
    std: TWO_WEEKS_BEFORE,
    stdutc: TWO_WEEKS_BEFORE,
    sta: addHours(TWO_WEEKS_BEFORE, 7),
    stautc: addHours(TWO_WEEKS_BEFORE, 7),
    etd: TWO_WEEKS_BEFORE,
    etdutc: TWO_WEEKS_BEFORE,
    eta: addHours(TWO_WEEKS_BEFORE, 7),
    etautc: addHours(TWO_WEEKS_BEFORE, 7),
  },
  segments: [
    createSegment(
      'segMDE1',
      { city: 'Medellín', iata: 'MDE', country: 'CO', terminal: '2' },
      { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
      TWO_WEEKS_BEFORE,
      1,
      { carrier: { code: 'AV', name: 'Avianca' }, number: 'AV001', model: 'A320' }
    ),
    createSegment(
      'segMDE2',
      { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
      { city: 'Guatemala City', iata: 'GUA', country: 'GT', terminal: '1' },
      addHours(TWO_WEEKS_BEFORE, 2),
      6,
      { carrier: { code: 'CM', name: 'Copa Airlines' }, number: 'CM342', model: 'B737' }
    ),
  ],
};

// 5. Long haul (Bogotá -> Madrid)
export const PAST_TRIP_BOG_MAD: PastTripCardVM = {
  origin: { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
  destination: { city: 'Madrid', iata: 'MAD', country: 'ES', terminal: '4S' },
  schedule: {
    std: THREE_DAYS_BEFORE,
    stdutc: THREE_DAYS_BEFORE,
    sta: addHours(THREE_DAYS_BEFORE, 10),
    stautc: addHours(THREE_DAYS_BEFORE, 10),
    etd: THREE_DAYS_BEFORE,
    etdutc: THREE_DAYS_BEFORE,
    eta: addHours(THREE_DAYS_BEFORE, 10),
    etautc: addHours(THREE_DAYS_BEFORE, 10),
  },
  segments: [
    createSegment(
      'segMAD1',
      { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
      { city: 'Madrid', iata: 'MAD', country: 'ES', terminal: '4S' },
      THREE_DAYS_BEFORE,
      10,
      { carrier: { code: 'IB', name: 'Iberia' }, number: 'IB6583', model: 'A350' }
    ),
  ],
};

// 6. Medium haul (Bogotá -> Sao Paulo)
export const PAST_TRIP_BOG_GRU: PastTripCardVM = {
  origin: { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
  destination: { city: 'Sao Paulo', iata: 'GRU', country: 'BR', terminal: '3' },
  schedule: {
    std: FOUR_DAYS_BEFORE,
    stdutc: FOUR_DAYS_BEFORE,
    sta: addHours(FOUR_DAYS_BEFORE, 6),
    stautc: addHours(FOUR_DAYS_BEFORE, 6),
    etd: FOUR_DAYS_BEFORE,
    etdutc: FOUR_DAYS_BEFORE,
    eta: addHours(FOUR_DAYS_BEFORE, 6),
    etautc: addHours(FOUR_DAYS_BEFORE, 6),
  },
  segments: [
    createSegment(
      'segGRU1',
      { city: 'Bogotá', iata: 'BOG', country: 'CO', terminal: '1' },
      { city: 'Sao Paulo', iata: 'GRU', country: 'BR', terminal: '3' },
      FOUR_DAYS_BEFORE,
      6,
      { carrier: { code: 'LA', name: 'LATAM Airlines' }, number: 'LA720', model: 'B787' }
    ),
  ],
};
