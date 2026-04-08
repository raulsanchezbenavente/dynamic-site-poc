import { SessionModals } from '@dcx/ui/business-common';

import type { LoyaltyOverviewCardConfig } from '../../models/loyalty-overview-card.config';

export const DATA_INITIAL_VALUE: LoyaltyOverviewCardConfig = {
  culture: 'en-us',
  dialogModalsRepository: {
    modalDialogExceptions: [
      {
        modalDialogSettings: {
          modalDialogId: SessionModals.SessionNotFound,
        },
        modalDialogContent: {
          modalTitle: 'Session Expired',
          modalDescription: 'Your session has expired or could not be found. Please reload the page to continue.',
          modalImageSrc: '',
        },
        modalDialogButtonsControl: {
          actionButtonLabel: 'Reload Page',
          secondaryButtonLabel: 'Go to Home',
          secondaryButtonLink: '/',
        },
      },
    ] as any,
  },
};
