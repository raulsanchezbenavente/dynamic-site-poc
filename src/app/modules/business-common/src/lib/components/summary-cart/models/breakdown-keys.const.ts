import type { Breakdown } from '@dcx/ui/libs';

export const BreakdownKeys = {
  PER_BOOKING: 'perBooking',
  PER_PAX: 'perPax',
  PER_PAX_SEGMENT: 'perPaxSegment',
  PER_SEGMENT: 'perSegment',
  PER_PAX_JOURNEY: 'perPaxJourney',
} as const;

export type BreakdownKey = keyof Breakdown;
