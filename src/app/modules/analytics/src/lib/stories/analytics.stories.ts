import { importProvidersFrom } from '@angular/core';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { AnalyticsModule } from '../analytics.module';

import { AnalyticsStoryComponent } from './mock-components/analytics.component';
import { STORYBOOK_PROVIDERS } from './providers/storybook.provider';

const META: Meta<AnalyticsStoryComponent> = {
  title: 'Main/Analytics',
  component: AnalyticsStoryComponent,
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(AnalyticsModule), ...STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AnalyticsStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
