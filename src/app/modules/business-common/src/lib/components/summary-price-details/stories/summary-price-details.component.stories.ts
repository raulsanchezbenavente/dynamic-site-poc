
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { SummaryPriceDetailsComponent } from '../summary-price-details.component';
import { SummaryTotalComponent } from '../../summary-total';
import { DescriptionListComponent, DescriptionListOptionType, PriceCurrencyComponent } from '@dcx/ui/design-system';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<SummaryPriceDetailsComponent> = {
  title: 'Components/Summary Panel/Summary Price Details',
  component: SummaryPriceDetailsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [
        SummaryPriceDetailsComponent,
        SummaryTotalComponent,
        PriceCurrencyComponent,
        DescriptionListComponent,
      ],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default meta;
type Story = StoryObj<SummaryPriceDetailsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      label: 'Price Details',
      translations: {},
      culture: 'en-US',
    },
    descriptionList: [
      {
        options: [
          {
            term: 'Item 1',
            type: DescriptionListOptionType.PRICE,
            description: {},
          },
          {
            term: 'Item 2',
            type: DescriptionListOptionType.STATUS,
            description: {},
          },
          {
            term: 'Item 3',
            type: DescriptionListOptionType.TEXT,
            description: {},
          },
        ],
      },
    ],
    descriptionListSummaryTotal: [
      {
        options: [
          {
            term: 'Total',
            type: DescriptionListOptionType.PRICE,
            description: {},
          },
        ],
      },
    ],
  },
};
