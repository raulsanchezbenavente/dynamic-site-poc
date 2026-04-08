import { PaxCategoryType } from '@dcx/ui/api-layer';
import { fakeSession } from '@dcx/ui/mock-repository';

const BOOKING_SESSION_SCENARIOS = {
  default: fakeSession,
  onlyOnePax: {
    ...fakeSession,
    pax: [fakeSession.pax[1]],
  },
  paxWithInfant: {
    ...fakeSession,
    pax: [
      {
        ...fakeSession.pax[0],
        type: {
          category: PaxCategoryType.ADULT,
          code: 'ADT',
        },
      },
      {
        ...fakeSession.pax[1],
        dependentPaxes: [fakeSession.pax[0].id],
      },
    ],
  },
};

export { BOOKING_SESSION_SCENARIOS };
