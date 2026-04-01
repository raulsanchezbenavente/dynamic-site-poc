import type { Meta, StoryObj } from '@storybook/angular';

import { StorybookDemoComponent } from '../components/ngx-translate-demo.component';

export default {
  title: 'NGX Translate/Integration',
  component: StorybookDemoComponent,
} as Meta<StorybookDemoComponent>;

export const DEFAULT: StoryObj<StorybookDemoComponent> = {
  render: (args) => ({
    props: args,
  }),
};
