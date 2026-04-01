import { ProgressBarComponent } from '@dcx/storybook/design-system';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<ProgressBarComponent> = {
  title: 'Molecules/Progress Bar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [ProgressBarComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<ProgressBarComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      min: {
        label: 'Red Plus',
        value: 0,
      },
      max: {
        label: 'Silver',
        value: 12000,
      },
      ariaAttributes: {
        ariaLabel: 'Progress bar description',
      },
      currentValue: 6000,
    },
  },
};

export const START: Story = {
  name: 'Start',
  args: {
    config: {
      min: {
        label: 'Red Plus',
        value: 0,
      },
      max: {
        label: 'Silver',
        value: 12000,
      },
      ariaAttributes: {
        ariaLabel: 'Progress bar description',
      },
      currentValue: 0,
    },
  },
};

export const PARTIAL: Story = {
  name: 'Partial',
  args: {
    config: {
      min: {
        label: 'Red Plus',
        value: 6000,
      },
      max: {
        label: 'Silver',
        value: 12000,
      },
      ariaAttributes: {
        ariaLabel: 'Progress bar description',
      },
      currentValue: 8000,
    },
  },
};

export const COMPLETE: Story = {
  name: 'Complete',
  args: {
    config: {
      min: {
        label: 'Red Plus',
        value: 6000,
      },
      max: {
        label: 'Silver',
        value: 12000,
      },
      ariaAttributes: {
        ariaLabel: 'Progress bar description',
      },
      currentValue: 12000,
    },
  },
};
