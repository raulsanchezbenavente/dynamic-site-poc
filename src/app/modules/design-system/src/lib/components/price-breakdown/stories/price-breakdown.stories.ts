import {
  PriceBreakdownComponent,
  PriceBreakdownHeaderComponent,
  PriceBreakdownItemComponent,
  PriceBreakdownItemsComponent,
  PriceCurrencyComponent,
} from '@dcx/storybook/design-system';

import { IBE_CODES_TRANSLATIONS } from '@dcx/ui/mock-repository';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PriceBreakdownComponent> = {
  title: 'Organisms/Price Breakdown',
  component: PriceBreakdownComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [PriceBreakdownComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

const calculateHeaderPrice = (list: any[]) => {
  return list.reduce((total, item) => {
    const itemPrice = item.item.price * (item.item.quantity || 1);
    const subitemsPrice = item.subitems?.reduce(
      (subTotal: number, subitem: { price: number; quantity: any }) =>
        subTotal + subitem.price * (subitem.quantity || 1),
      0
    );
    return total + itemPrice + subitemsPrice;
  }, 0);
};

const PRICE_BREAKDOWN_LIST = [
  { item: { quantity: 1, code: 'MUSI', price: 100, currency: 'EUR' }, subitems: [] },
  {
    item: { quantity: 2, code: 'SKIS', price: 100, currency: 'EUR' },
    subitems: [{ quantity: 2, code: 'code', price: 200, currency: 'COP' }],
  },
  { item: { quantity: 2, code: 'SCUB', price: 1440, currency: 'EUR' }, subitems: [] },
  { item: { quantity: 1, code: 'WUDP.s', price: 340, currency: 'EUR' }, subitems: [] },
  { item: { quantity: 1, code: 'ZQAD.s', price: 40, currency: 'EUR' }, subitems: [] },
];

export default META;
type Story = StoryObj<PriceBreakdownComponent>;

export const COLLAPSED: Story = {
  name: 'Collapsed',
  args: {
    translations: {
      ...IBE_CODES_TRANSLATIONS,
    },
    model: {
      config: [
        {
          header: {
            isCollapsed: true,
            config: {
              label: 'Taxes and Services',
              // secondLabel: 'Price breakdown',
              price: calculateHeaderPrice(PRICE_BREAKDOWN_LIST),
              currency: 'EUR',
              isCollapsible: true,
              ariaAttributes: {
                ariaLabel: 'Price breakdown',
                ariaControls: 'price-breakdown-header',
              },
            },
          },
          list: PRICE_BREAKDOWN_LIST,
          accessibilityConfig: { id: 'pbreak1' },
        },
      ],
    },
  },
};

export const EXPANDED: Story = {
  name: 'Expanded',
  args: {
    translations: {
      ...IBE_CODES_TRANSLATIONS,
    },
    model: {
      config: [
        {
          header: {
            isCollapsed: false,
            config: COLLAPSED.args!.model!.config[0].header.config,
          },
          list: COLLAPSED.args!.model!.config[0].list,
          accessibilityConfig: { id: 'pbreak2' },
        },
      ],
    },
  },
};

export const NOT_COLLAPSIBLE: Story = {
  name: 'Not collapsible',
  args: {
    translations: {
      ...IBE_CODES_TRANSLATIONS,
    },
    model: {
      config: [
        {
          header: {
            ...COLLAPSED.args!.model!.config[0].header,
            config: {
              ...EXPANDED.args!.model!.config[0].header.config,
              isCollapsible: false,
            },
          },
          list: COLLAPSED.args!.model!.config[0].list,
          accessibilityConfig: { id: 'pbreak3' },
        },
      ],
    },
  },
};
