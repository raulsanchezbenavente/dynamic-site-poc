import { LanguageSelectorComponent } from '@dcx/storybook/design-system';
import { DropdownLayoutType } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<LanguageSelectorComponent> = {
  title: 'Molecules/Selection Controls/Language Selector',
  component: LanguageSelectorComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [LanguageSelectorComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<LanguageSelectorComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    culture: 'es-ES',
    config: {
      dropdownModel: {
        value: '',
        config: {
          label: 'Change language, current',
          icon: {
            name: 'language',
          },
          layoutConfig: {
            layout: DropdownLayoutType.DEFAULT,
          },
        },
        isVisible: true,
      },
      optionsListConfig: {
        options: [
          {
            code: 'en-US',
            name: 'English',
          },
          {
            code: 'fr-FR',
            name: 'French',
          },
          {
            code: 'es-ES',
            name: 'Español (España)',
          },
          {
            code: 'es-CO',
            name: 'Español (Colombia)',
          },
          {
            code: 'pt-BR',
            name: 'Português (Brasil)',
          },
          {
            code: 'pt-PT',
            name: 'Português (Portugal)',
          },
        ],
        ariaAttributes: {
          ariaLabel: 'Language options list',
        },
      },
    },
  },
};
