import { fakeSegmentsStatus } from '@dcx/ui/mock-repository';

const SEGMENT_STATUS_SCENARIOS = {
  default: fakeSegmentsStatus,
  landed: [
    {
      ...fakeSegmentsStatus[0],
      status: 'Landed',
    },
  ],
  cancelled: [
    {
      ...fakeSegmentsStatus[0],
      status: 'Cancelled',
    },
  ],
  onRoute: [
    {
      ...fakeSegmentsStatus[0],
      status: 'OnRoute',
    },
  ],
  diverted: [
    {
      ...fakeSegmentsStatus[0],
      status: 'Diverted',
    },
  ],
  delayed: [
    {
      ...fakeSegmentsStatus[0],
      status: 'Delayed',
    },
  ],
  returned: [
    {
      ...fakeSegmentsStatus[0],
      status: 'Returned',
    },
  ],
};

export { SEGMENT_STATUS_SCENARIOS };
