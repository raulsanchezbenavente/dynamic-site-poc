
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { RemainingTimeComponent } from "@dcx/storybook/design-system";
import { CommonTranslationKeys } from '@dcx/ui/libs';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<RemainingTimeComponent> = {
  title: 'Molecules/Remaining Time',
  component: RemainingTimeComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: false,
      mock: {
        'CheckIn.RemainingTime_Label': 'Check-in disponible en:',
        [CommonTranslationKeys.Common_LabelDays]: 'días',
        [CommonTranslationKeys.Common_LabelHours]: 'horas'
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [RemainingTimeComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<RemainingTimeComponent>;

export const DEFAULT: Story = {
  name: 'Default (comma format)',
  args: {
    config: {
      labelDictionaryKey: 'CheckIn',
    },
    timeMeasure: {
      days: 5,
      hours: 2,
      minutes: 0,
      seconds: 0,
    },
  },
};

export const CONJUNTION_FORMAT: Story = {
  name: 'Default (conjunction format)',
  args: {
    config: {
      labelDictionaryKey: 'CheckIn',
      joinStyle: 'conjunction',
    },
    timeMeasure: {
      days: 5,
      hours: 2,
      minutes: 0,
      seconds: 0,
    },
  },
};
