import { PriceCurrencyComponent, RangeSliderComponent } from '@dcx/storybook/design-system';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<RangeSliderComponent> = {
  title: 'Molecules/Selection Controls/Range Slider',
  component: RangeSliderComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [RangeSliderComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<RangeSliderComponent>;

export const ACTIVE: Story = {
  name: 'Active',
  args: {
    config: {
      maxValueSelected: 100,
      selectedPercentage: 0,
      steps: 1,
      label: 'Maximun price',
      id: 'id',
      isDisabled: false,
      hasMinValue: true,
      currency: 'EUR',
      minValue: 0,
      maxValue: 100,
      currencySymbol: '€',
    },
  },
};

export const DISABLED: Story = {
  name: 'Disabled',
  args: {
    config: {
      maxValueSelected: 100,
      selectedPercentage: 0,
      steps: 1,
      label: 'Label',
      id: 'id',
      isDisabled: true,
      hasMinValue: true,
      currency: 'EUR',
      minValue: 0,
      maxValue: 100,
      currencySymbol: '€',
    },
  },
};
