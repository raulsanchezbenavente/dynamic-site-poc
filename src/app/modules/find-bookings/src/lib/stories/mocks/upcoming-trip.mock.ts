/* eslint-disable @typescript-eslint/naming-convention */
import type { JourneyLocation, JourneySchedule, JourneyVM, SegmentVM } from '@dcx/ui/libs';
import { JourneyStatus, TransportType } from '@dcx/ui/libs';

import type { ManageBookingCardVM } from '../../components/manage-booking-card/models/manage-booking-card-vm.model';

const NOW = Date.now();

function addHours(h: number): Date {
  return new Date(NOW + h * 36000);
}

function buildLocation(iata: string, terminal = '1'): JourneyLocation {
  return {
    city: iata,
    iata,
    iataOperation: iata,
    terminal,
    country: '',
  };
}

function buildSchedule(dep: Date, arr: Date): JourneySchedule {
  return {
    std: dep,
    sta: arr,
    stdutc: dep,
    stautc: arr,
    etd: dep,
    etdutc: dep,
    eta: arr,
    etautc: arr,
  };
}

function buildSegment(
  id: string,
  origin: JourneyLocation,
  destination: JourneyLocation,
  schedule: JourneySchedule,
  durationH: number,
  status?: JourneyStatus
): SegmentVM {
  const duration = `${durationH.toString().padStart(2, '0')}:00:00`;
  return {
    id,
    origin,
    destination,
    schedule,
    legs: [
      {
        origin: origin.iata ?? origin.city,
        destination: destination.iata ?? destination.city,
        duration,
        std: schedule.std,
        stdutc: schedule.stdutc!,
        sta: schedule.sta,
        stautc: schedule.stautc!,
        etd: schedule.etd,
        etdutc: schedule.etdutc,
        eta: schedule.eta,
        etautc: schedule.etautc,
        transport: {
          carrier: { code: 'XX', name: 'Demo Carrier' },
          number: 'XX123',
          type: TransportType.PLANE,
        },
      },
    ],
    duration,
    transport: {
      carrier: { code: 'XX', name: 'Demo Carrier' },
      number: 'XX123',
      type: TransportType.PLANE,
    },
    status,
  };
}

export function buildJourneyVM(
  pnr: string,
  originIata: string,
  destinationIata: string,
  departureHoursAhead: number,
  durationHours: number,
  status?: JourneyStatus
): JourneyVM {
  const dep = addHours(departureHoursAhead);
  const arr = addHours(departureHoursAhead + durationHours);

  const origin = buildLocation(originIata, '1');
  const destination = buildLocation(destinationIata, '2');
  const schedule = buildSchedule(dep, arr);
  const segment = buildSegment(`${pnr}-SEG`, origin, destination, schedule, durationHours, status);

  return {
    id: pnr,
    origin,
    destination,
    schedule,
    segments: [segment],
    duration: segment.duration!,
    status,
  };
}

export function buildManageBookingCard(
  pnr: string,
  origin: string,
  dest: string,
  hAhead: number,
  durationH: number,
  status: JourneyStatus,
  opts?: {
    checkIn?: boolean;
    mmb?: boolean;
    total?: number;
  }
): ManageBookingCardVM {
  return {
    journeyVM: buildJourneyVM(pnr, origin, dest, hAhead, durationH, status),
    checkInDeepLinkUrl: `https://checkin.example.com/${pnr}`,
    isCheckInAvailable: !!opts?.checkIn,
    isMmbAvailable: !!opts?.mmb,
    mmbDeepLinkUrl: `https://mmb.example.com/${pnr}`,
    pageNumber: 1,
    totalRecords: opts?.total ?? 0,
  };
}

// Mocks variados
export const UPCOMING_TRIPS_MOCK: ManageBookingCardVM[] = [
  // Check-in disponible (<24h)
  buildManageBookingCard('PNR-CKIN', 'BOG', 'MIA', 12, 4, JourneyStatus.CONFIRMED, {
    checkIn: true,
    mmb: false,
    total: 4,
  }),
  // Fuera de ventana de check-in (>24h) MMB disponible
  buildManageBookingCard('PNR-LATE', 'MIA', 'JFK', 30, 3, JourneyStatus.CONFIRMED, {
    checkIn: false,
    mmb: true,
    total: 4,
  }),
  // Retrasado y check-in abierto
  buildManageBookingCard('PNR-DELAY', 'MAD', 'BCN', 5, 1, JourneyStatus.DELAYED, {
    checkIn: true,
    mmb: false,
    total: 4,
  }),
  // Cancelado (sin acciones)
  buildManageBookingCard('PNR-CANCEL', 'LAX', 'SFO', 48, 1, JourneyStatus.CANCELLED, {
    checkIn: false,
    mmb: false,
    total: 4,
  }),
];

// Factory para generar N viajes futuros (útil si quieres un control en Storybook)
export function generateUpcomingTrips(count: number): ManageBookingCardVM[] {
  return Array.from({ length: count }).map((_, i) =>
    buildManageBookingCard(`PNR-DYN-${i + 1}`, 'BOG', 'MIA', 6 + i * 3, 2, JourneyStatus.CONFIRMED, {
      checkIn: i % 2 === 0,
      mmb: i % 2 !== 0,
      total: count,
    })
  );
}
