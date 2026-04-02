import { Transport, TransportType } from '@dcx/ui/libs';

/**
 * Represents a fake Transport (`TRANSPORT_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Transport} TRANSPORT_BC_FAKE.
 */
export const TRANSPORT_BC_FAKE: Transport = {
  carrier: {
    code: 'AV',
    name: 'Avianca',
  },
  type: TransportType.PLANE,
  number: '789E',
  model: '1320',
  manufacturer: 'AIRBUS',
};
