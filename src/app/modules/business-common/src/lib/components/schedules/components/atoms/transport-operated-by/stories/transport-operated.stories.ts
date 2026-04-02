import { provideAnimations } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../../providers/storybook.providers';
import { TransportOperatedByComponent } from '../transport-operated-by.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<TransportOperatedByComponent> = {
  title: 'Components/Journey/Schedules/_Components/Transport Operated By',
  component: TransportOperatedByComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: [],
    i18n: {
      api: false,
      mock: {
        'Common.Carriers.OperatedBy': 'Operated by',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default META;
type Story = StoryObj<TransportOperatedByComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: [{ name: 'avianca' }],
  },
};
export const MULTIPLE_AIRLINES: Story = {
  name: 'Multiples Airlines',
  args: {
    data: [{ name: 'avianca' }, { name: 'latam' }, { name: 'gol' }],
  },
};
