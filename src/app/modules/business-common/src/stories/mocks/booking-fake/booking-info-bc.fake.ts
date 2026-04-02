import type { BookingInfo } from '@dcx/ui/libs';
import { TripType } from '@dcx/ui/libs';

/**
 * Represents a fake BookingInfo (`BOOKING_INFO_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {BookingInfo} BOOKING_INFO_BC_FAKE.
 */
export const BOOKING_INFO_BC_FAKE: BookingInfo = {
  referenceId: '',
  recordLocator: '4JF3W7',
  comments: [
    {
      type: 'Default',
      data: 'COUNTRY:EU^OT44',
    },
    {
      type: 'Default',
      data: 'CULTURE:ES-ES^OT43',
    },
    {
      type: 'Default',
      data: 'PAXID: PT6, GENDER: FEMALE^OT59',
    },
    {
      type: 'Default',
      data: 'PAXID: PT3, GENDER: FEMALE^OT56',
    },
    {
      type: 'Default',
      data: 'PAXID: PT5, GENDER: MALE^OT58',
    },
    {
      type: 'Default',
      data: 'PERSONAL DATA USE OPTION: TRUE^OT54',
    },
    {
      type: 'Default',
      data: 'PAXID: PT2, GENDER: MALE^OT55',
    },
    {
      type: 'Default',
      data: 'PAXID: PT4, GENDER: MALE^OT57',
    },
  ],
  queues: [],
  status: 'Hold',
  createdDate: '2024-08-02T09:29:00Z',
  pointOfSale: {
    agent: {
      id: 'MADAV08LL',
    },
    organization: {
      id: '',
    },
    channelType: 0,
    posCode: 'POS1',
  },
  tripType: TripType.ROUND_TRIP,
};
