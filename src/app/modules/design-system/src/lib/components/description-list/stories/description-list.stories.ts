import type {
  DescriptionList,
  DescriptionListItem,
  DescriptionListItemData,
  DescriptionListPriceData,
  DescriptionListStatusData,
  DescriptionListTextData,
} from '@dcx/storybook/design-system';
import {
  DescriptionListComponent,
  DescriptionListLayoutType,
  DescriptionListOptionType,
  StatusTagType,
} from '@dcx/storybook/design-system';
import type { TooltipConfig } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DescriptionListComponent> = {
  title: 'Molecules/DescriptionList',
  component: DescriptionListComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [DescriptionListComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DescriptionListComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      ariaAttributes: {},
      options: [
        {
          term: 'Type',
          type: DescriptionListOptionType.TEXT,
          description: {
            text: 'Credit Card',
          } as DescriptionListTextData,
        } as DescriptionListItem,
        {
          term: 'Date',
          type: DescriptionListOptionType.DATE,
          description: {
            date: { fullFormat: 'EEEE d MMMM y' },
            dateValue: new Date('2024-09-12'),
            dateFormatLayoutType: DescriptionListLayoutType.DEFAULT,
          } as DescriptionListItemData,
        } as DescriptionListItem,
        {
          term: 'Status',
          type: DescriptionListOptionType.STATUS,
          description: {
            statusType: StatusTagType.SUCCESS,
            text: 'Approved',
          } as DescriptionListStatusData,
        } as DescriptionListItem,
        {
          term: 'Price',
          type: DescriptionListOptionType.PRICE,
          description: {
            currency: 'EUR',
            price: 1941.5,
          } as DescriptionListPriceData,
          tooltipConfig: {
            triggerText: 'See more',
            text: 'Here goes tooltip content.',
            iconOnly: true,
          } as TooltipConfig,
        } as DescriptionListItem,
      ],
      layout: DescriptionListLayoutType.DEFAULT,
    } as DescriptionList,
  },
};
export const COLUMN: Story = {
  name: 'Column',
  args: {
    config: {
      ...DEFAULT.args?.config,
      layout: DescriptionListLayoutType.COLUMN,
    } as DescriptionList,
  },
};
export const INLINE: Story = {
  name: 'Inline',
  args: {
    config: {
      ...DEFAULT.args?.config,
      layout: DescriptionListLayoutType.INLINE,
    } as DescriptionList,
  },
};
