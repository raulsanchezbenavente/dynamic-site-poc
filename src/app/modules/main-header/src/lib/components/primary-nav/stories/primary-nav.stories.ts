import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { DATA_INITIAL_VALUE } from '../../../stories/data/data-inital-value.fake';
import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.providers';
import { PrimaryNavComponent } from '../primary-nav.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<PrimaryNavComponent> = {
  title: 'Molecules/Primary Nav',
  component: PrimaryNavComponent,
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
type Story = StoryObj<PrimaryNavComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    isResponsive: true,
    mainMenuList: [...DATA_INITIAL_VALUE.mainMenuList],
  },
};
