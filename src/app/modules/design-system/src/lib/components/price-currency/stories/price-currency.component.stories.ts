import { PriceCurrencyComponent } from '@dcx/storybook/design-system';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PriceCurrencyComponent> = {
  title: 'Molecules/Price Currency',
  component: PriceCurrencyComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {
    price: {
      control: 'range',
      min: 0,
      max: 10000,
    },
    decimalDigits: {
      control: 'range',
      min: 0,
      max: 10,
    },
    currency: {
      control: 'select',
      options: ['USD', 'EUR'],
    },
    format: {
      control: 'select',
      options: ['IntegerOnly', 'CompleteNumber'],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [PriceCurrencyComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<PriceCurrencyComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    currency: 'COP',
    price: 5433,
    decimalDigits: 2,
    format: 'IntegerOnly',
    prefixText: 'From',
  },
};

export const DISCOUNT: Story = {
  name: 'Discount',
  args: {
    currency: 'EUR',
    price: 5433,
    decimalDigits: 2,
    suffixText: '(-50%)',
    format: 'IntegerOnly',
  },
};
