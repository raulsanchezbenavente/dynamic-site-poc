
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { LoyaltyPointsComponent } from '../loyalty-points.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<LoyaltyPointsComponent> = {
  title: 'Components/Loyalty/LoyaltyPoints',
  component: LoyaltyPointsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [LoyaltyPointsComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<LoyaltyPointsComponent>;

const LP_DEFAULT_ARGS = {
  loyaltyPointsModel: {
    amount: '100',
    label: 'Loyalty Points',
  },
};

export const DEFAULT: Story = {
  name: 'Default',
  args: LP_DEFAULT_ARGS,
};

export const POSITIVE: Story = {
  name: 'Positive',
  args: {
    ...LP_DEFAULT_ARGS,
    loyaltyPointsModel: {
      ...LP_DEFAULT_ARGS.loyaltyPointsModel,
      isPositiveSymbol: true,
      symbol: '+',
    },
  },
};
export const NEGATIVE: Story = {
  name: 'Negative',
  args: {
    ...LP_DEFAULT_ARGS,
    loyaltyPointsModel: {
      ...LP_DEFAULT_ARGS.loyaltyPointsModel,
      isPositiveSymbol: false,
      symbol: '-',
    },
  },
};
