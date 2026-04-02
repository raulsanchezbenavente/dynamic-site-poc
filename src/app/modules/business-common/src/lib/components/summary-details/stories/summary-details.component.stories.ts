
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { SummaryDetailsComponent } from '../summary-details.component';
import { SummaryPriceDetailsComponent } from '../../summary-price-details';
import { SummaryTotalComponent } from '../../summary-total';
import { SummaryDetailsSection } from '../enums/summary-details-section.enum';
import { DescriptionListComponent, DescriptionListOptionType, DescriptionListPriceData, PriceCurrencyComponent } from '@dcx/ui/design-system';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<SummaryDetailsComponent> = {
  title: 'Components/Summary Panel/Summary Details',
  component: SummaryDetailsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [
        SummaryDetailsComponent,
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
type Story = StoryObj<SummaryDetailsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      label: 'Price Details',
      translations: {},
      culture: 'en-US',
    },
    descriptionListBySection: [
      {
        section: SummaryDetailsSection.PRICE,
        descriptionList: [
          {
            options: [
              {
                term: 'Item 1',
                type: DescriptionListOptionType.PRICE,
                description: {
                  price: 100,
                  currency: 'COP',
                } as DescriptionListPriceData,
              },
              {
                term: 'Item 2',
                type: DescriptionListOptionType.PRICE,
                description: {
                  price: 200,
                  currency: 'COP',
                } as DescriptionListPriceData,
              },
              {
                term: 'Item 3',
                type: DescriptionListOptionType.PRICE,
                description: {
                  price: 300,
                  currency: 'COP',
                } as DescriptionListPriceData,
              },
            ],
          },
        ],
      },
      {
        section: SummaryDetailsSection.TOTAL,
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
      },
    ],
  },
};
