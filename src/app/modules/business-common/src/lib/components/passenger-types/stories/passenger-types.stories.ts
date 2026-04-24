import { PaxTypeCode } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { PassengerTypesComponent } from '../passenger-types.component';
import { TranslationKeys } from '../enums/translation-keys.enum';

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
        [TranslationKeys.PassengerTypes_ADT]: 'Adult',
        [TranslationKeys.PassengerTypes_Plural_ADT]: 'Adults',
        [TranslationKeys.PassengerTypes_CHD]: 'Child',
        [TranslationKeys.PassengerTypes_Plural_CHD]: 'Children',
        [TranslationKeys.PassengerTypes_INF]: 'Infant',
        [TranslationKeys.PassengerTypes_Plural_INF]: 'Infants',
        [TranslationKeys.PassengerTypes_TNG]: 'Teenager',
        [TranslationKeys.PassengerTypes_Plural_TNG]: 'Teenagers',
        [TranslationKeys.PassengerTypes_EXST]: 'Extra Seat',
        [TranslationKeys.PassengerTypes_INS]: 'Infant with Seat',
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
