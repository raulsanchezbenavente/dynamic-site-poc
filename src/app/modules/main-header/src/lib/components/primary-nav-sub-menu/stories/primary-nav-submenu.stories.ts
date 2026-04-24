import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { DATA_INITIAL_VALUE_MAINMENU } from '../../../stories/data/data-inital-value.fake';
import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.providers';
import { PrimaryNavSubMenuComponent } from '../primary-nav-sub-menu.component';
import { signal } from '@angular/core';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<PrimaryNavSubMenuComponent> = {
  title: 'Molecules/Primary Nav SubMenu',
  component: PrimaryNavSubMenuComponent,
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
type Story = StoryObj<PrimaryNavSubMenuComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    isResponsive: true,
    focusedSubmenuIndex: signal<number | null>(0),
    menuItem: DATA_INITIAL_VALUE_MAINMENU[1],
  },
};
