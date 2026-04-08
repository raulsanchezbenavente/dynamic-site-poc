import { fakeSegmentsCheckinStatus } from '@dcx/ui/mock-repository';

const SEGMENTS_CHECKIN_STATUS_SCENARIOS = {
  default: fakeSegmentsCheckinStatus,
  allAvailableForCheckIn: [
    {
      ...fakeSegmentsCheckinStatus[0],
      pax: fakeSegmentsCheckinStatus[0].pax.map((pax) => ({
        ...pax,
        status: 'Allowed',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[1],
      pax: fakeSegmentsCheckinStatus[1].pax.map((pax) => ({
        ...pax,
        status: 'Allowed',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[2],
      pax: fakeSegmentsCheckinStatus[2].pax.map((pax) => ({
        ...pax,
        status: 'Allowed',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[3],
      pax: fakeSegmentsCheckinStatus[3].pax.map((pax) => ({
        ...pax,
        status: 'Allowed',
      })),
    },
    ,
  ],
  allCheckedIn: [
    {
      ...fakeSegmentsCheckinStatus[0],
      pax: fakeSegmentsCheckinStatus[0].pax.map((pax) => ({
        ...pax,
        status: 'CheckedIn',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[1],
      pax: fakeSegmentsCheckinStatus[1].pax.map((pax) => ({
        ...pax,
        status: 'CheckedIn',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[2],
      pax: fakeSegmentsCheckinStatus[2].pax.map((pax) => ({
        ...pax,
        status: 'CheckedIn',
      })),
    },
    {
      ...fakeSegmentsCheckinStatus[3],
      pax: fakeSegmentsCheckinStatus[3].pax.map((pax) => ({
        ...pax,
        status: 'CheckedIn',
      })),
    },
  ],
};

export { SEGMENTS_CHECKIN_STATUS_SCENARIOS };
