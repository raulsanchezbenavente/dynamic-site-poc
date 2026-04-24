import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import type { Meta, StoryObj } from '@storybook/angular';

import { FooterMainComponent } from '../footer-main.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<FooterMainComponent> = {
  title: 'Main/Footer Main',
  component: FooterMainComponent,
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['FooterMain'],
    i18n: {
      api: false,
      mock: {},
    },
  },
};

export default META;
type Story = StoryObj<FooterMainComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
