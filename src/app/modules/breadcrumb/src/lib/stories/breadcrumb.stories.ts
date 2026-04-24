import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { BreadcrumbComponent } from '../breadcrumb.component';

import { STORYBOOK_PROVIDERS } from './providers/storybook.provider';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<BreadcrumbComponent> = {
  title: 'Main/Breadcrumb',
  component: BreadcrumbComponent,
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  parameters: {
    i18n: {
      api: true,
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<BreadcrumbComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
