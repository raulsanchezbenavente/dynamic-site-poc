import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../../providers/storybook.providers';
import { BannerAnimationEffect } from '../../../../enums';
import { BANNER_DEFAULT_ITEMS } from '../../../../stories/data/data-inital-value.fake';
import { BannerControlsComponent } from '../banner-controls.component';


const META: Meta<BannerControlsComponent> = {
  title: 'Organisms/Banner/Banner Controls',
  component: BannerControlsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [BannerControlsComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<BannerControlsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      accessibilityConfig: {
        id: '1',
      },
      items: BANNER_DEFAULT_ITEMS,
      showControls: true,
      showPagination: true,
    },
    animation: {
      cycleTime: 10000,
      effect: BannerAnimationEffect.FADING,
    },
  },
};
