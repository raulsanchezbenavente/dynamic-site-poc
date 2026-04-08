import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.provider';
import { LoyaltyTierBadgeComponent } from '../loyalty-tier-badge.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<LoyaltyTierBadgeComponent> = {
  title: 'Molecules/Loyalty Tier Badge',
  component: LoyaltyTierBadgeComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  parameters: {
    i18n: {
      api: true,
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<LoyaltyTierBadgeComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      tierName: 'red plus',
    },
  },
};
