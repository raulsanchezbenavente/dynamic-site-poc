import { BookingContact } from '@dcx/ui/libs';

/**
 * Represents a fake BookingContact (`BOOKING_CONTACT_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {BookingContact[]} BOOKING_CONTACT_BC_FAKE.
 */
export const BOOKING_CONTACT_BC_FAKE: BookingContact[] = [
  {
    id: '7E7E426F6F6B696E677E46414B454441544140544553542E434F4D',
    type: 'Booking',
    mktOption: false,
    name: {
      title: 'Default',
      first: '',
      middle: '',
      last: '',
    },
    documents: [],
    channels: [
      {
        type: 'Email',
        scope: 3,
        info: 'FAKEDATA@TEST.COM',
        prefix: '',
        cultureCode: 'ES-ES',
        additionalData: 'standard',
      },
      {
        type: 'Phone',
        scope: 1,
        info: '4343343443',
        prefix: '+57',
        cultureCode: 'ES-ES',
        additionalData: 'standard',
      },
    ],
  },
  {
    id: '7E7E426F6F6B696E677E353734333433333433343433',
    type: 'Booking',
    mktOption: false,
    name: {
      title: 'Default',
      first: '',
      middle: '',
      last: '',
    },
    documents: [],
    channels: [
      {
        type: 'Phone',
        scope: 3,
        info: '574343343443',
        prefix: '',
        cultureCode: 'ES-ES',
        additionalData: 'notification',
      },
      {
        type: 'Email',
        scope: 3,
        info: 'FAKEDATA@TEST.COM',
        prefix: '',
        cultureCode: 'ES-ES',
        additionalData: 'notification',
      },
    ],
  },
];
