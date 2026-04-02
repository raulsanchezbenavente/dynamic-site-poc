import { PaxTypeCode } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { PassengerTypesComponent } from '../passenger-types.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PassengerTypesComponent> = {
  title: 'Components/Passenger Types',
  component: PassengerTypesComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['PassengersTypes'],
    i18n: {
      mock: {
        'PassengerTypes.ADT': 'Adult',
        'PassengerTypes.Plural_ADT': 'Adults',
        'PassengerTypes.CHD': 'Child',
        'PassengerTypes.Plural_CHD': 'Children',
        'PassengerTypes.INF': 'Infant',
        'PassengerTypes.Plural_INF': 'Infants',
        'PassengerTypes.TNG': 'Teenager',
        'PassengerTypes.Plural_TNG': 'Teenagers',
        'PassengerTypes.EXST': 'Extra Seat',
        'PassengerTypes.INS': 'Infant with Seat',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [PassengerTypesComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<PassengerTypesComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    model: {
      config: [
        {
          code: PaxTypeCode.ADT,
          quantity: 1,
        },
        {
          code: PaxTypeCode.CHD,
          quantity: 1,
        },
        {
          code: PaxTypeCode.INF,
          quantity: 1,
        },
      ],
    },
  },
};

export const PLURAL: Story = {
  name: 'Plural',
  args: {
    model: {
      config: [
        {
          code: PaxTypeCode.ADT,
          quantity: 2,
        },
        {
          code: PaxTypeCode.CHD,
          quantity: 2,
        },
        {
          code: PaxTypeCode.INF,
          quantity: 4,
        },
        {
          code: PaxTypeCode.TNG,
          quantity: 6,
        },
      ],
    },
  },
};
