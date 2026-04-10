import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import { type Meta, type StoryObj } from '@storybook/angular';

import { CorporateMainHeaderComponent } from '../main-header.component';

import { DATA_INITIAL_VALUE } from './data/data-inital-value.fake';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<CorporateMainHeaderComponent> = {
  title: 'Main/Main Header',
  component: CorporateMainHeaderComponent,
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['CorporateMainHeader'],
    i18n: {
      api: false,
      mock: {
        'Auth.AuthButton.SignIn': 'Sign In',
        'PointsOfSale.Trigger_Label': ' Select your currency and language',
      },
    },
    layout: 'fullscreen',
  },
};

export default META;
type Story = StoryObj<CorporateMainHeaderComponent>;

export const LAYOUT_DEFAULT: Story = {
  name: 'Layout Default',
  args: {
    config: {
      ...DATA_INITIAL_VALUE,
    },
  },
};
