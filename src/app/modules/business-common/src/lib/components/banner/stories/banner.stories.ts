import { LayoutSize, SectionColors } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { BannerComponent } from '../banner.component';

import {
  BANNER_ANIMATION_CURRENCY,
  BANNER_ITEM_ASIDE,
  BANNER_ITEM_DESTINATIONS,
  BANNER_ITEM_LIFEMILES_PAGE,
  BANNER_ITEM_PROMO_DESTINATIONS,
  BANNER_ITEM_SECTION,
  BANNER_ITEM_VIDEO,
  BANNER_ITEMS_ACCOUNT_SETTINGS_PAGE,
  DATA_INITIAL_VALUE,
} from './data/data-inital-value.fake';

const META: Meta<BannerComponent> = {
  title: 'Organisms/Banner',
  component: BannerComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<BannerComponent>;

// Default style
export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_PROMO_DESTINATIONS,
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

export const DEFAULT_WITH_PRICE: Story = {
  name: 'Default (With Price)',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_PROMO_DESTINATIONS,
          configuration: {
            ...BANNER_ITEM_PROMO_DESTINATIONS.configuration,
            enableLowestPrice: true,
          },
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

// default font size variation
export const DEFAULT_LARGE_FONT: Story = {
  name: 'Default (Large Font)',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_DESTINATIONS,
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

export const DEFAULT_FONT_SIZE_SMALL: Story = {
  name: 'Default (Small Font)',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_DESTINATIONS,
          layout: {
            ...BANNER_ITEM_DESTINATIONS.layout,
            fontSize: LayoutSize.SMALL,
          },
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

export const DEFAULT_VIDEO: Story = {
  name: 'Default (Video)',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_VIDEO,
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

// Aside Style
export const ASIDE_BOX_DEFAULT: Story = {
  name: 'Aside Box (Default)',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_ASIDE,
          configuration: {
            ...BANNER_ITEM_ASIDE.configuration,
            enableLowestPrice: false,
          },
        },
      ],
    },
    ...BANNER_ANIMATION_CURRENCY,
  },
};

// Sections
export const ASIDE_BOX_OFFER_SECTION: Story = {
  name: 'Aside Box (Offer)',
  args: {
    ...ASIDE_BOX_DEFAULT.args,
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_SECTION,
          sectionColors: SectionColors.OFFER,
        },
      ],
    },
  },
};
export const ASIDE_BOX_INFO_SECTION: Story = {
  name: 'Aside Box (Info)',
  args: {
    ...ASIDE_BOX_DEFAULT.args,
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_SECTION,
          sectionColors: SectionColors.INFO,
        },
      ],
    },
  },
};
export const ASIDE_BOX_INFO_SECTION_BOOKING: Story = {
  name: 'Aside Box (Booking)',
  args: {
    ...ASIDE_BOX_DEFAULT.args,
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_SECTION,
          sectionColors: SectionColors.BOOKING,
        },
      ],
    },
  },
};
export const ASIDE_BOX_INFO_SECTION_FARE_BUSINESS: Story = {
  name: 'Aside Box (Fare Business)',
  args: {
    ...ASIDE_BOX_DEFAULT.args,
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [
        {
          ...BANNER_ITEM_SECTION,
          sectionColors: SectionColors.FARE_BUSINESS,
        },
      ],
    },
  },
};

export const LIFEMILES_BANNER: Story = {
  name: 'Members/Lifemiles Benefits',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [BANNER_ITEM_LIFEMILES_PAGE],
    },
  },
};

export const ACCOUNT_SETTINGS_BANNER: Story = {
  name: 'Members/Lifemiles To Wallet Banner',
  args: {
    config: {
      ...DATA_INITIAL_VALUE.banner,
      bannerItems: [BANNER_ITEMS_ACCOUNT_SETTINGS_PAGE],
    },
  },
};
