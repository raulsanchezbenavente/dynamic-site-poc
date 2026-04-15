import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { GroupOptionsComponent } from '../group-options.component';
import { STORYBOOK_PROVIDERS } from '../providers/storybook.provider';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<GroupOptionsComponent> = {
  title: 'Main/Group Options',
  component: GroupOptionsComponent,
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<GroupOptionsComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
