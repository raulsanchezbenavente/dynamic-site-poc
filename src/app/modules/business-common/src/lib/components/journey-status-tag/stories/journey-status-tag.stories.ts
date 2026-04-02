import { JourneyStatus } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { JourneyStatusComponent } from '../journey-status-tag.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<JourneyStatusComponent> = {
  title: 'Components/Journey/Journey Status Tag',
  component: JourneyStatusComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Journey.Status'],
    i18n: {
      mock: {
        'Journey.Status.Confirmed': 'Confirmado',
        'Journey.Status.Delayed': 'Demorado',
        'Journey.Status.Cancelled': 'Cancelado',
        'Journey.Status.Departed': 'Despego',
        'Journey.Status.Returned': 'Retorno al origen',
        'Journey.Status.Diverted': 'Desviado',
        'Journey.Status.Landed': 'Aterrizó',
        'Journey.Status.OnTime': 'Confirmado',
        'Journey.Status.OnRoute': 'Despegó',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [JourneyStatusComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<JourneyStatusComponent>;

export const LANDED: Story = {
  name: 'Landed',
  parameters: {},
  args: {
    status: JourneyStatus.LANDED,
  },
};

export const CANCELLED: Story = {
  name: 'Cancelled',
  parameters: {},
  args: {
    status: JourneyStatus.CANCELLED,
  },
};

export const DEPARTED: Story = {
  name: 'Departed',
  parameters: {},
  args: {
    status: JourneyStatus.DEPARTED,
  },
};

export const DIVERTED: Story = {
  name: 'Diverted',
  parameters: {},
  args: {
    status: JourneyStatus.DIVERTED,
  },
};

export const RETURNED: Story = {
  name: 'Returned',
  parameters: {},
  args: {
    status: JourneyStatus.RETURNED,
  },
};

export const CONFIRMED: Story = {
  name: 'Confirmed',
  parameters: {},
  args: {
    status: JourneyStatus.CONFIRMED,
  },
};
