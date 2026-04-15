import { ModalDialogActionType } from '@dcx/ui/libs';

import type { PastTripCardVM } from '../../components/past-trip-card/models/past-trip-card-vm.model';
import { FindBookingsModals } from '../../enums/find-bookings-modals.enum';
import type { FindBookingsConfig } from '../../models/find-bookings.config';
import {
  PAST_TRIP_BOG_GRU,
  PAST_TRIP_BOG_MAD,
  PAST_TRIP_CLO_LIM,
  PAST_TRIP_DEFAULT,
  PAST_TRIP_MDE_GUA,
} from '../mocks/past-trip-card.mock';
import { UPCOMING_TRIPS_MOCK } from '../mocks/upcoming-trip.mock';

export const DATA_INITIAL_VALUE: FindBookingsConfig & {
  mockData?: {
    upcoming: typeof UPCOMING_TRIPS_MOCK;
    past: PastTripCardVM[];
  };
} = {
  mmbUrl: 'http://test-mmb.com',
  checkinUrl: 'http://test-checkin.com',
  earlyCheckinEligibleStationCodes: ['BOG', 'CLO'],
  carriersList: [],
  dialogModalsRepository: {
    modalDialogExceptions: [
      {
        modalDialogSettings: { modalDialogId: FindBookingsModals.MY_TRIPS },
        modalDialogContent: {
          modalTitle: 'Error',
          modalDescription: 'Description',
          modalImageSrc: 'image.png',
        },
        modalDialogButtonsControl: {
          showClose: true,
          showButtons: true,
          actionButtonLabel: 'Retry',
          secondaryButtonLabel: 'Cancel',
          secondaryButtonLink: '',
          actionButtonControl: ModalDialogActionType.RESTART_SEARCH,
          secondaryButtonControl: ModalDialogActionType.CLOSE,
        },
      },
    ],
  },
  mockData: {
    upcoming: UPCOMING_TRIPS_MOCK,
    past: [PAST_TRIP_DEFAULT, PAST_TRIP_CLO_LIM, PAST_TRIP_MDE_GUA, PAST_TRIP_BOG_MAD, PAST_TRIP_BOG_GRU],
  },
};
