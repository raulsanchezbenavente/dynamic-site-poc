import { TabSkeletonComponent } from '@dcx/ui/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { STORYBOOK_PROVIDERS } from '../../../../../../stories/providers/storybook.providers';

const META: Meta<TabSkeletonComponent> = {
  title: 'Molecules/Tabs/Tab Skeleton',
  component: TabSkeletonComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [NgxSkeletonLoaderModule],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<TabSkeletonComponent>;

export const TAB_SKELETON_DEFAULT: Story = {
  name: 'Tab skeleton default',
  args: {
    isLoading: true,
  },
};
