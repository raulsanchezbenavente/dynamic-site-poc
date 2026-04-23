import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { PAST_TRIP_DEFAULT, PAST_TRIP_SINGLE_CARRIER } from '../../../stories/mocks/past-trip-card.mock';
import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.provider';
import { PastTripCardComponent } from '../past-trip-card.component';
import { CommonTranslationKeys } from '@dcx/ui/libs';

const META: Meta<PastTripCardComponent> = {
  title: 'Molecules/Past trip card',
  component: PastTripCardComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['City'],
    i18n: {
      api: false,
      mock: {
        'City.BOG': 'Bogotá',
        'City.MIA': 'Miami',
        'City.JFK': 'New York',
        [CommonTranslationKeys.Common_Carriers_OperatedBy]: 'Operated by',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<PastTripCardComponent>;

export const DEFAULT: Story = {
  name: 'Default (2 carriers)',
  args: {
    data: PAST_TRIP_DEFAULT,
  },
};

export const SINGLE_CARRIER: Story = {
  name: 'Single carrier',
  args: {
    data: PAST_TRIP_SINGLE_CARRIER,
  },
};
