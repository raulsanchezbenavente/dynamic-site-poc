import { JourneyStatus } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { JourneyStatusComponent } from '../journey-status-tag.component';
import { TranslationKeys } from '../enums/translation-keys.enum';

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
    i18nModules: [TranslationKeys.Journey_Status],
    i18n: {
      mock: {
        [TranslationKeys.Journey_Status_Confirmed]: 'Confirmado',
        [TranslationKeys.Journey_Status_Delayed]: 'Demorado',
        [TranslationKeys.Journey_Status_Cancelled]: 'Cancelado',
        [TranslationKeys.Journey_Status_Departed]: 'Despego',
        [TranslationKeys.Journey_Status_Returned]: 'Retorno al origen',
        [TranslationKeys.Journey_Status_Diverted]: 'Desviado',
        [TranslationKeys.Journey_Status_Landed]: 'Aterrizó',
        [TranslationKeys.Journey_Status_OnTime]: 'Confirmado',
        [TranslationKeys.Journey_Status_OnRoute]: 'Despegó',
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
