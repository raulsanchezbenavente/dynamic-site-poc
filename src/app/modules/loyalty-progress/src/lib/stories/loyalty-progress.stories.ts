import { type Meta, type StoryObj } from '@storybook/angular';

import { LoyaltyProgressComponent } from '../loyalty-progress.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<LoyaltyProgressComponent> = {
  title: 'Main/Loyalty Progress',
  component: LoyaltyProgressComponent,
  parameters: {
    i18n: {
      mock: {
        'Loyalty.Progress.Title': 'Progress',
        'Loyalty.Progress.PointsLabel.LM': 'lifemiles',
        'Loyalty.Progress.PointsLabel.AV': 'AV puntos',
      },
    },
  },
};

export default META;
type Story = StoryObj<LoyaltyProgressComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
