import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { AnalyticsStoryComponent } from './mock-components/analytics.component';
import { STORYBOOK_PROVIDERS } from './providers/storybook.provider';

const META: Meta<AnalyticsStoryComponent> = {
  title: 'Main/Analytics',
  component: AnalyticsStoryComponent,
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    applicationConfig({
      providers: [...STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AnalyticsStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
