import { Transport, TransportType } from '@dcx/ui/libs';

export const TRANSPORT_FAKE: Transport = {
  carrier: {
    code: 'AV',
    name: 'Avianca',
  },
  type: TransportType.PLANE,
  number: '789E',
  model: 'A320',
  manufacturer: 'AIRBUS',
};
