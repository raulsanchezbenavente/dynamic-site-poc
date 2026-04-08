import { type Meta, type StoryObj } from '@storybook/angular';

import { LoyaltyStatusOverviewComponent } from '../loyalty-status-overview.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<LoyaltyStatusOverviewComponent> = {
  title: 'Main/Loyalty Status Overview',
  component: LoyaltyStatusOverviewComponent,
  tags: ['autodocs'],
  parameters: {
    i18n: {
      mock: {},
    },
  },
};

export default META;
type Story = StoryObj<LoyaltyStatusOverviewComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
