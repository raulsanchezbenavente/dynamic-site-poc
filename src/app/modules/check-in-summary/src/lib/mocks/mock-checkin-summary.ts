import { PaxSegmentCheckinStatus } from '@dcx/ui/api-layer';
import { CheckInSummaryVM } from '@dcx/ui/business-common';
import { JourneyStatus, JourneyVM } from '@dcx/ui/libs';
import { JOURNEYS_FAKE } from '@dcx/ui/mock-repository';

const departureJourney = JOURNEYS_FAKE[0] as JourneyVM;
const arrivalJourney = JOURNEYS_FAKE[1] as JourneyVM;

export const MOCK_CHECKIN_SUMMARY: CheckInSummaryVM = {
  journeys: [
    {
      ...departureJourney,
      isCheckInAvailable: true,
      status: JourneyStatus.CONFIRMED,
      passengers: [
        {
          id: 'PAX-001',
          name: 'María Benitez Iglesias',
          detail: 'Con bebé Laura Camila Benitez',
          lifemilesNumber: '1010239443',
          status: PaxSegmentCheckinStatus.CHECKED_IN,
          referenceId: 'REF-001',
        },
        {
          id: 'PAX-002',
          name: 'María Mónica López Pabón',
          detail: '',
          lifemilesNumber: '1010239555',
          status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
          referenceId: 'REF-002',
        },
        {
          id: 'PAX-006',
          name: 'Carlos Ramírez Torres',
          detail: '',
          lifemilesNumber: '1010239666',
          status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
          referenceId: 'REF-006',
        },
        {
          id: 'PAX-007',
          name: 'Ana Sofía Méndez',
          detail: '',
          lifemilesNumber: '1010239777',
          status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
          referenceId: 'REF-007',
        },
        {
          id: 'PAX-005',
          name: 'John Arias Valencia',
          detail: 'Con bebé Laura Camila Benitez',
          lifemilesNumber: '1010239443',
          status: PaxSegmentCheckinStatus.NOT_ALLOWED,
          referenceId: 'REF-005',
        },
      ],
    },
    {
      ...arrivalJourney,
      isCheckInAvailable: false,
      status: JourneyStatus.DELAYED,
      passengers: [
        {
          id: 'PAX-003',
          name: 'Carlos Ramírez Torres',
          detail: '',
          lifemilesNumber: '1010239666',
          status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
          referenceId: 'REF-003',
        },
        {
          id: 'PAX-004',
          name: 'Ana Sofía Méndez',
          detail: '',
          lifemilesNumber: '1010239777',
          status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
          referenceId: 'REF-004',
        },
      ],
    },
  ],
};
