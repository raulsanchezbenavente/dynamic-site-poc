import { provideAnimations } from '@angular/platform-browser/animations';
import { TransportType } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../../providers/storybook.providers';
import { LegsDetailsComponent } from '../legs-details.component';
import { TranslationKeys } from '../../../../enums/translation-keys.enum';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<LegsDetailsComponent> = {
  title: 'Components/Journey/Schedules/_Components/Legs Details',
  component: LegsDetailsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'City', 'Schedule'],
    i18n: {
      mock: {
        [TranslationKeys.Schedule_Stop]: 'stop (mock)',
        [TranslationKeys.Schedule_Stops]: 'stops (mock)',
        [TranslationKeys.Schedule_Connection_Title]: 'Detalles del vuelo (mock)',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [LegsDetailsComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default META;
type Story = StoryObj<LegsDetailsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: {
      model: {
        duration: '13:01:40',
        stopsNumber: 2,
        legs: [
          {
            origin: 'RIO',
            destination: 'BOG',
            duration: '06:15',
            std: new Date('2025-03-25T07:25:00'),
            sta: new Date('2025-03-25T11:40:00'),
            stdutc: new Date('2025-03-25T10:25:00'),
            stautc: new Date('2025-03-25T14:40:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '260',
              model: 'BOEING7878',
              manufacturer: 'BOEING',
            },
          },
          {
            origin: 'BOG',
            destination: 'MDE',
            duration: '00:59',
            std: new Date('2025-03-25T13:59:00'),
            sta: new Date('2025-03-25T14:58:00'),
            stdutc: new Date('2025-03-25T18:59:00'),
            stautc: new Date('2025-03-25T19:58:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '9318',
              model: 'A320',
              manufacturer: 'AIRBUS',
            },
          },
          {
            origin: 'MDE',
            destination: 'PEI',
            duration: '00:52',
            std: new Date('2025-03-25T17:34:00'),
            sta: new Date('2025-03-25T18:26:00'),
            stdutc: new Date('2025-03-25T22:34:00'),
            stautc: new Date('2025-03-25T23:26:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '9619',
              model: 'A320',
              manufacturer: 'AIRBUS',
            },
          },
        ],
      },
    },
  },
};

export const ONE_STOP: Story = {
  name: '1 stop',
  args: {
    data: {
      model: {
        duration: '09:01',
        stopsNumber: 1,
        legs: [
          {
            origin: 'BOG',
            destination: 'MDE',
            duration: '00:59',
            std: new Date('2025-03-25T13:59:00'),
            sta: new Date('2025-03-25T14:58:00'),
            stdutc: new Date('2025-03-25T18:59:00'),
            stautc: new Date('2025-03-25T19:58:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '9318',
              model: 'A320',
              manufacturer: 'AIRBUS',
            },
          },
          {
            origin: 'MDE',
            destination: 'PEI',
            duration: '00:52',
            std: new Date('2025-03-25T17:34:00'),
            sta: new Date('2025-03-25T18:26:00'),
            stdutc: new Date('2025-03-25T22:34:00'),
            stautc: new Date('2025-03-25T23:26:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '9619',
              model: 'A320',
              manufacturer: 'AIRBUS',
            },
          },
        ],
      },
    },
  },
};

export const DIRECT: Story = {
  name: 'Direct',
  args: {
    data: {
      model: {
        duration: '09:01',
        stopsNumber: 0,
        legs: [
          {
            origin: 'BOG',
            destination: 'MDE',
            duration: '00:59',
            std: new Date('2025-03-25T13:59:00'),
            sta: new Date('2025-03-25T14:58:00'),
            stdutc: new Date('2025-03-25T18:59:00'),
            stautc: new Date('2025-03-25T19:58:00'),
            transport: {
              carrier: {
                code: 'AV',
                name: 'avianca',
              },
              type: TransportType.PLANE,
              number: '9318',
              model: 'A320',
              manufacturer: 'AIRBUS',
            },
          },
        ],
      },
    },
  },
};
