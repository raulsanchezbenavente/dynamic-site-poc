
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { SummaryTotalComponent } from '../summary-total.component';
import { PriceCurrencyComponent } from '@dcx/ui/design-system';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<SummaryTotalComponent> = {
  title: 'Components/Summary Panel/Summary Total',
  component: SummaryTotalComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [SummaryTotalComponent, PriceCurrencyComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SummaryTotalComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      label: 'Total',
    },
    data: {
      amount: 100,
      currency: 'COP',
    },
  },
};
